-- Numeração feita pelo banco, sem duplicar.
-- Antes: o navegador calculava "maior número + 1"; dois aparelhos ao mesmo tempo podiam gerar o mesmo Nº.
-- Agora: no INSERT, o banco trava a numeração daquele dentista (ou daquele paciente) e atribui o próximo número.
-- O número já existente de um registro nunca muda (UPDATE não passa por aqui).
-- Funções SECURITY INVOKER: a RLS continua valendo, o dentista só "enxerga" os próprios números.

begin;

create or replace function private.assign_record_number()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Uma numeração por dentista: chamadas simultâneas esperam a vez.
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
security invoker
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

drop trigger if exists patients_assign_record_number on public.patients;
create trigger patients_assign_record_number
  before insert on public.patients
  for each row execute function private.assign_record_number();

drop trigger if exists visits_assign_sequence on public.visits;
create trigger visits_assign_sequence
  before insert on public.visits
  for each row execute function private.assign_visit_sequence();

commit;
