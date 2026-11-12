-- =============================================================================
-- Retenção do prontuário por 20 anos (Lei 13.787/2018): exclusão lógica.
--
-- O quê:   "Excluir" paciente ou consulta passa a ARQUIVAR (deleted_at preenchido).
--          O registro some do app, mas continua guardado no banco pelo prazo legal.
-- Como:    * Coluna deleted_at em patients e visits.
--          * As policies de SELECT/UPDATE/DELETE só alcançam registros ativos
--            (deleted_at IS NULL): o arquivado fica invisível e imutável para o dentista.
--          * Um gatilho BEFORE DELETE troca a exclusão física por arquivamento e
--            devolve NULL (nenhuma linha é apagada). Assim o app continua com um único
--            DELETE atômico, e nenhum usuário (authenticated) consegue apagar de verdade.
--          * Arquivar o paciente arquiva junto as consultas e desvincula a agenda,
--            como fazia a cascata antes.
--          * deleted_at não pode ser escolhido pelo cliente: nasce NULL, só o gatilho
--            preenche (com now()) e, depois de preenchido, não muda mais.
--          * A numeração (Nº do prontuário e da consulta) passa a enxergar os
--            arquivados, para nunca reaproveitar um número já usado.
--
-- Eliminação definitiva depois do prazo: tarefa administrativa (fora do app),
-- desligando o gatilho numa transação de manutenção. Nenhuma chave ou rota do app faz isso.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Colunas
-- -----------------------------------------------------------------------------

alter table public.patients add column if not exists deleted_at timestamptz;
alter table public.visits   add column if not exists deleted_at timestamptz;

comment on column public.patients.deleted_at is 'Quando foi arquivado ("excluído" no app). Guardado por 20 anos (Lei 13.787/2018).';
comment on column public.visits.deleted_at   is 'Quando foi arquivada ("excluída" no app). Guardada por 20 anos (Lei 13.787/2018).';

create index if not exists patients_owner_active_idx on public.patients (owner_id) where deleted_at is null;
create index if not exists visits_patient_active_idx on public.visits (patient_id) where deleted_at is null;

-- -----------------------------------------------------------------------------
-- deleted_at: só o banco escreve, e uma vez só
-- -----------------------------------------------------------------------------

create or replace function private.guard_deleted_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.deleted_at := null;
  elsif old.deleted_at is not null and new.deleted_at is distinct from old.deleted_at then
    raise exception 'registro arquivado não pode ser alterado' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.guard_deleted_at() from public, anon, authenticated;

drop trigger if exists patients_guard_deleted_at on public.patients;
create trigger patients_guard_deleted_at
  before insert or update on public.patients
  for each row execute function private.guard_deleted_at();

drop trigger if exists visits_guard_deleted_at on public.visits;
create trigger visits_guard_deleted_at
  before insert or update on public.visits
  for each row execute function private.guard_deleted_at();

-- -----------------------------------------------------------------------------
-- DELETE vira arquivamento
-- SECURITY DEFINER porque o registro arquivado deixa de passar na policy de SELECT
-- (o próprio dono não conseguiria gravar a linha "escondida"). Só roda como gatilho:
-- EXECUTE revogado de todos, search_path vazio, nomes sempre qualificados.
-- -----------------------------------------------------------------------------

create or replace function private.archive_patient_instead_of_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.patients set deleted_at = now() where id = old.id and deleted_at is null;
  update public.visits set deleted_at = now() where patient_id = old.id and deleted_at is null;
  update public.appointments set patient_id = null where patient_id = old.id;
  return null; -- nada é apagado de verdade
end;
$$;

create or replace function private.archive_visit_instead_of_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.visits set deleted_at = now() where id = old.id and deleted_at is null;
  return null; -- nada é apagado de verdade
end;
$$;

revoke all on function private.archive_patient_instead_of_delete() from public, anon, authenticated;
revoke all on function private.archive_visit_instead_of_delete() from public, anon, authenticated;

drop trigger if exists patients_archive_instead_of_delete on public.patients;
create trigger patients_archive_instead_of_delete
  before delete on public.patients
  for each row execute function private.archive_patient_instead_of_delete();

drop trigger if exists visits_archive_instead_of_delete on public.visits;
create trigger visits_archive_instead_of_delete
  before delete on public.visits
  for each row execute function private.archive_visit_instead_of_delete();

-- -----------------------------------------------------------------------------
-- Policies: o dentista só alcança registros ativos
-- -----------------------------------------------------------------------------

drop policy if exists patients_select_own on public.patients;
create policy patients_select_own on public.patients
  for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id and deleted_at is null);

drop policy if exists patients_update_own on public.patients;
create policy patients_update_own on public.patients
  for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id and deleted_at is null)
  with check ((select auth.uid()) = owner_id);

drop policy if exists patients_delete_own on public.patients;
create policy patients_delete_own on public.patients
  for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id and deleted_at is null);

drop policy if exists visits_select_own on public.visits;
create policy visits_select_own on public.visits
  for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id and deleted_at is null);

drop policy if exists visits_update_own on public.visits;
create policy visits_update_own on public.visits
  for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id and deleted_at is null)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.patients p
      where p.id = patient_id and p.owner_id = (select auth.uid())
    )
  );

drop policy if exists visits_delete_own on public.visits;
create policy visits_delete_own on public.visits
  for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id and deleted_at is null);

-- -----------------------------------------------------------------------------
-- Numeração enxerga os arquivados (número usado nunca volta)
-- Passa a SECURITY DEFINER: a RLS agora esconde os arquivados do dono. A função só lê o
-- maior número do dono informado na linha; a policy de INSERT continua exigindo que esse
-- dono seja quem está logado.
-- -----------------------------------------------------------------------------

create or replace function private.assign_record_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('patients:' || new.owner_id::text, 0));
  if new.record_number is null
     or new.record_number <= 0
     or exists (
       select 1 from public.patients p
       where p.owner_id = new.owner_id and p.record_number = new.record_number and p.id <> new.id
     )
  then
    select coalesce(max(p.record_number), 0) + 1 into new.record_number
    from public.patients p
    where p.owner_id = new.owner_id;
  end if;
  return new;
end;
$$;

create or replace function private.assign_visit_sequence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('visits:' || new.patient_id::text, 0));
  if new.sequence is null
     or new.sequence <= 0
     or exists (
       select 1 from public.visits v
       where v.patient_id = new.patient_id and v.sequence = new.sequence and v.id <> new.id
     )
  then
    select coalesce(max(v.sequence), 0) + 1 into new.sequence
    from public.visits v
    where v.patient_id = new.patient_id;
  end if;
  return new;
end;
$$;

revoke all on function private.assign_record_number() from public, anon, authenticated;
revoke all on function private.assign_visit_sequence() from public, anon, authenticated;

commit;
