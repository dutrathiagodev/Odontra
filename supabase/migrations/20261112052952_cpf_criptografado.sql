-- =============================================================================
-- CPF criptografado no banco.
--
-- O quê:   O CPF sai do JSON livre (identification) e vai para cpf_encrypted, cifrado com
--          pgcrypto (pgp_sym_encrypt) usando uma chave guardada no Supabase Vault.
--          Para listas e busca fica só a versão mascarada (cpf_masked: ***.456.789-**).
-- Chave:   Gerada aqui DENTRO do banco (gen_random_bytes) e guardada no Vault com o nome
--          'odontra_cpf_key'. Nenhuma chave aparece em arquivo, migration ou no app.
--          O Vault cifra o segredo com a chave raiz do projeto, que fica fora do banco
--          (um dump/backup sozinho não abre o CPF).
-- Gravar:  O app continua mandando identification.cpf. Um gatilho (SECURITY DEFINER, só
--          gatilho) cifra, preenche cpf_masked e apaga o CPF do JSON antes de gravar.
--          Regra do JSON: "cpf" presente e vazio = apagar o CPF; "cpf" ausente = não mexer.
-- Ler:     RPC public.get_patient_cpf(p_id) (SECURITY INVOKER: a RLS decide se o paciente
--          é visível) chama private.decrypt_patient_cpf, que confere de novo o dono.
--          Exceção documentada à regra do schema private: authenticated recebe USAGE no
--          schema e EXECUTE só nesta função; todas as outras continuam fechadas.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Chave no Vault (criada uma vez, valor aleatório gerado no banco)
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'odontra_cpf_key') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'base64'),
      'odontra_cpf_key',
      'Chave do CPF dos pacientes (pgcrypto). Não apagar: sem ela o CPF gravado não abre.'
    );
  end if;
end;
$$;

create or replace function private.cpf_key()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  k text;
begin
  select ds.decrypted_secret into k from vault.decrypted_secrets ds where ds.name = 'odontra_cpf_key';
  if k is null or k = '' then
    raise exception 'chave do CPF não configurada no Vault (odontra_cpf_key)';
  end if;
  return k;
end;
$$;

revoke all on function private.cpf_key() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Colunas
-- -----------------------------------------------------------------------------

alter table public.patients
  add column if not exists cpf_encrypted bytea,
  add column if not exists cpf_masked text not null default '' check (char_length(cpf_masked) <= 20);

comment on column public.patients.cpf_encrypted is 'CPF cifrado (pgcrypto + chave odontra_cpf_key no Vault). Ler só pela RPC get_patient_cpf.';
comment on column public.patients.cpf_masked is 'CPF mascarado para listas e busca (***.456.789-**). Calculado pelo gatilho.';

-- Mesmo formato de domain/patient/cpf.ts (maskCpf).
create or replace function private.mask_cpf(cpf text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when d = '' then ''
    when char_length(d) = 11 then '***.' || substr(d, 4, 3) || '.' || substr(d, 7, 3) || '-**'
    else '***'
  end
  from (select regexp_replace(coalesce(cpf, ''), '\D', '', 'g') as d) s;
$$;

revoke all on function private.mask_cpf(text) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Gatilho: cifra e tira o CPF do JSON
-- -----------------------------------------------------------------------------

create or replace function private.protect_patient_cpf()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  plain text;
begin
  if new.identification ? 'cpf' then
    plain := btrim(coalesce(new.identification ->> 'cpf', ''));
    new.identification := jsonb_set(new.identification, '{cpf}', '""'::jsonb);
    if plain = '' then
      new.cpf_encrypted := null;
      new.cpf_masked := '';
    else
      new.cpf_encrypted := extensions.pgp_sym_encrypt(plain, private.cpf_key());
      new.cpf_masked := private.mask_cpf(plain);
    end if;
  elsif tg_op = 'UPDATE' then
    -- Sem "cpf" no JSON: mantém o que estava (o cliente não grava as colunas direto).
    new.cpf_encrypted := old.cpf_encrypted;
    new.cpf_masked := old.cpf_masked;
  else
    new.cpf_encrypted := null;
    new.cpf_masked := '';
  end if;
  return new;
end;
$$;

revoke all on function private.protect_patient_cpf() from public, anon, authenticated;

drop trigger if exists patients_protect_cpf on public.patients;
create trigger patients_protect_cpf
  before insert or update on public.patients
  for each row execute function private.protect_patient_cpf();

-- -----------------------------------------------------------------------------
-- Leitura: só o dono, pela RPC
-- -----------------------------------------------------------------------------

create or replace function private.decrypt_patient_cpf(p_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select extensions.pgp_sym_decrypt(p.cpf_encrypted, private.cpf_key())
  from public.patients p
  where p.id = p_id
    and (select auth.uid()) is not null
    and p.owner_id = (select auth.uid())
    and p.deleted_at is null
    and p.cpf_encrypted is not null;
$$;

revoke all on function private.decrypt_patient_cpf(uuid) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.decrypt_patient_cpf(uuid) to authenticated;

create or replace function public.get_patient_cpf(p_id uuid)
returns text
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  -- A RLS de patients decide: paciente de outro dentista (ou arquivado) não aparece.
  if not exists (select 1 from public.patients p where p.id = p_id) then
    return null;
  end if;
  return private.decrypt_patient_cpf(p_id);
end;
$$;

comment on function public.get_patient_cpf(uuid) is 'CPF do paciente em texto, só para o dentista dono. Não registrar o retorno em log.';

revoke all on function public.get_patient_cpf(uuid) from public, anon;
grant execute on function public.get_patient_cpf(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Dados que já existem: cifra o CPF que estava no JSON (sem mexer em updated_at)
-- -----------------------------------------------------------------------------

alter table public.patients disable trigger patients_set_updated_at;
update public.patients
  set identification = identification
  where coalesce(identification ->> 'cpf', '') <> '';
alter table public.patients enable trigger patients_set_updated_at;

commit;
