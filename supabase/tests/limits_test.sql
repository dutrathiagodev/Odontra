-- Limites de tamanho dos JSON e formato da foto. Rodar com: supabase test db
BEGIN;
SELECT plan(14);

INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role) VALUES
  ('ffffffff-0000-4000-8000-000000000001', 'lim@teste.dev', '{}', 'authenticated', 'authenticated');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"ffffffff-0000-4000-8000-000000000001","role":"authenticated"}';

-- Foto
SELECT lives_ok($$INSERT INTO public.patients (id, record_number, photo) VALUES ('ffffffff-1000-4000-8000-000000000001', 1, '')$$, 'sem foto e aceito');
SELECT lives_ok($$INSERT INTO public.patients (record_number, photo) VALUES (2, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==')$$, 'JPEG em base64 e aceito');
SELECT lives_ok($$INSERT INTO public.patients (record_number, photo) VALUES (3, 'data:image/png;base64,iVBORw0KGgo=')$$, 'PNG em base64 e aceito');
SELECT lives_ok($$INSERT INTO public.patients (record_number, photo) VALUES (4, 'data:image/webp;base64,UklGRg==')$$, 'WebP em base64 e aceito');
SELECT throws_ok($$INSERT INTO public.patients (record_number, photo) VALUES (5, 'https://exemplo.com/foto.jpg')$$, '23514', NULL, 'endereco da web nao e foto');
SELECT throws_ok($$INSERT INTO public.patients (record_number, photo) VALUES (5, 'data:image/svg+xml;base64,PHN2Zz4=')$$, '23514', NULL, 'SVG e recusado');
SELECT throws_ok($$INSERT INTO public.patients (record_number, photo) VALUES (5, 'data:text/html;base64,PGgxPg==')$$, '23514', NULL, 'HTML e recusado');
SELECT throws_ok($$INSERT INTO public.patients (record_number, photo) VALUES (5, 'data:image/jpeg;base64,abc"><script>')$$, '23514', NULL, 'base64 com lixo e recusado');
SELECT throws_ok($$INSERT INTO public.patients (record_number, photo) VALUES (5, 'data:image/jpeg;base64,' || repeat('A', 600000))$$, '23514', NULL, 'foto acima de 600000 caracteres e recusada');

-- JSON da ficha
SELECT throws_ok(
  $$UPDATE public.patients SET identification = jsonb_build_object('name', repeat('a', 17000)) WHERE id = 'ffffffff-1000-4000-8000-000000000001'$$,
  '23514', NULL, 'identificacao acima de 16 KB e recusada');
SELECT throws_ok(
  $$UPDATE public.patients SET anamnesis = jsonb_build_object('notes', repeat('a', 33000)) WHERE id = 'ffffffff-1000-4000-8000-000000000001'$$,
  '23514', NULL, 'anamnese acima de 32 KB e recusada');
SELECT lives_ok(
  $$UPDATE public.patients SET anamnesis = jsonb_build_object('notes', repeat('a', 30000)) WHERE id = 'ffffffff-1000-4000-8000-000000000001'$$,
  'anamnese longa dentro do limite e aceita');

-- JSON da consulta
SELECT throws_ok(
  $$INSERT INTO public.visits (patient_id, sequence, odontogram) VALUES ('ffffffff-1000-4000-8000-000000000001', 1, jsonb_build_object('11', repeat('a', 70000)))$$,
  '23514', NULL, 'odontograma acima de 64 KB e recusado');
SELECT lives_ok(
  $$INSERT INTO public.visits (patient_id, sequence, clinical_exam) VALUES ('ffffffff-1000-4000-8000-000000000001', 1, jsonb_build_object('tongue', repeat('a', 60000)))$$,
  'bloco da consulta dentro do limite e aceito');

SELECT * FROM finish();
ROLLBACK;
