-- =============================================================================
-- Limites de tamanho nos blocos JSON e formato da foto.
--
-- O quê:   CHECK no banco para que nenhum cliente (nem chamada direta à API) grave
--          JSON gigante ou "foto" que não é imagem.
-- Limites: identification <= 16 KB, anamnesis <= 32 KB, cada bloco JSON da consulta <= 64 KB
--          (medido como texto, octet_length(coluna::text)).
--          photo: vazia, ou data URL JPEG/PNG/WebP em base64, até 600000 caracteres (o limite
--          de tamanho já existia).
-- Os mesmos limites estão no app (domain/record-limits.ts e domain/patient/photo.ts),
-- que avisa antes de enviar.
--
-- Dados antigos: as regras entram como NOT VALID (valem para todo INSERT/UPDATE novo) e
-- em seguida o banco tenta validar o que já existe. Se algum registro antigo não passar
-- (ex.: foto de exemplo gravada como endereço da web), a regra continua valendo para
-- gravações novas e a migration não falha; o aviso sai no log (NOTICE).
-- =============================================================================

begin;

alter table public.patients
  add constraint patients_identification_size_check
    check (octet_length(identification::text) <= 16384) not valid,
  add constraint patients_anamnesis_size_check
    check (octet_length(anamnesis::text) <= 32768) not valid,
  add constraint patients_photo_format_check
    check (photo = '' or photo ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$') not valid;

alter table public.visits
  add constraint visits_dentist_size_check
    check (octet_length(dentist::text) <= 65536) not valid,
  add constraint visits_oral_health_size_check
    check (octet_length(oral_health::text) <= 65536) not valid,
  add constraint visits_clinical_exam_size_check
    check (octet_length(clinical_exam::text) <= 65536) not valid,
  add constraint visits_odontogram_size_check
    check (octet_length(odontogram::text) <= 65536) not valid;

do $$
declare
  c record;
begin
  for c in
    select * from (values
      ('public.patients', 'patients_identification_size_check'),
      ('public.patients', 'patients_anamnesis_size_check'),
      ('public.patients', 'patients_photo_format_check'),
      ('public.visits', 'visits_dentist_size_check'),
      ('public.visits', 'visits_oral_health_size_check'),
      ('public.visits', 'visits_clinical_exam_size_check'),
      ('public.visits', 'visits_odontogram_size_check')
    ) as t(tbl, con)
  loop
    begin
      execute format('alter table %s validate constraint %I', c.tbl, c.con);
    exception when check_violation then
      raise notice 'Regra % ficou NOT VALID: há registros antigos fora do limite em %.', c.con, c.tbl;
    end;
  end loop;
end;
$$;

commit;
