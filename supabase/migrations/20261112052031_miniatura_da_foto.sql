-- =============================================================================
-- Miniatura da foto para a lista de pacientes.
--
-- O quê:   photo_thumb (JPEG ~96px em data URL, gerado no app ao salvar) e has_photo
--          (calculado pelo banco). A lista busca só essas colunas, sem baixar a foto inteira;
--          a ficha continua carregando a foto completa.
-- Compatibilidade: pacientes antigos ficam com photo_thumb vazio. A lista usa has_photo
--          para saber quem tem foto sem miniatura e busca a foto só desses; a miniatura
--          é criada na próxima vez que a ficha for salva.
-- =============================================================================

begin;

alter table public.patients
  add column if not exists photo_thumb text not null default '',
  add column if not exists has_photo boolean generated always as (photo <> '') stored;

comment on column public.patients.photo_thumb is 'Miniatura da foto (JPEG ~96px, data URL) para listas. Vazia quando não há foto ou em cadastro antigo.';
comment on column public.patients.has_photo is 'Calculado: o paciente tem foto. Permite à lista saber disso sem baixar a foto.';

alter table public.patients
  add constraint patients_photo_thumb_format_check
    check (
      photo_thumb = ''
      or (char_length(photo_thumb) <= 20000
          and photo_thumb ~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$')
    ),
  add constraint patients_photo_thumb_needs_photo_check
    check (photo_thumb = '' or photo <> '');

commit;
