-- Miniatura da foto para a lista. Rodar com: supabase test db
BEGIN;
SELECT plan(7);

INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role) VALUES
  ('abababab-0000-4000-8000-000000000001', 'thumb@teste.dev', '{}', 'authenticated', 'authenticated');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"abababab-0000-4000-8000-000000000001","role":"authenticated"}';

INSERT INTO public.patients (id, record_number, photo, photo_thumb) VALUES
  ('abababab-1000-4000-8000-000000000001', 1, 'data:image/jpeg;base64,/9j/AAAA', 'data:image/jpeg;base64,/9j/BB=='),
  ('abababab-1000-4000-8000-000000000002', 2, 'data:image/jpeg;base64,/9j/AAAA', ''),
  ('abababab-1000-4000-8000-000000000003', 3, '', '');

SELECT results_eq(
  $$SELECT has_photo FROM public.patients ORDER BY record_number$$,
  $$VALUES (true), (true), (false)$$,
  'has_photo calculado pelo banco');
SELECT is(
  (SELECT count(*) FROM public.patients WHERE has_photo AND photo_thumb = '')::int, 1,
  'cadastro antigo (foto sem miniatura) e identificavel sem baixar a foto');
SELECT throws_ok(
  $$UPDATE public.patients SET has_photo = false WHERE id = 'abababab-1000-4000-8000-000000000001'$$,
  '428C9', NULL, 'has_photo nao e gravado pelo cliente');
SELECT throws_ok(
  $$INSERT INTO public.patients (record_number, photo, photo_thumb) VALUES (4, 'data:image/jpeg;base64,/9j/AAAA', 'data:image/png;base64,iVBORw0KGgo=')$$,
  '23514', NULL, 'miniatura so em JPEG');
SELECT throws_ok(
  $$INSERT INTO public.patients (record_number, photo, photo_thumb) VALUES (4, 'data:image/jpeg;base64,/9j/AAAA', 'data:image/jpeg;base64,' || repeat('A', 20000))$$,
  '23514', NULL, 'miniatura acima de 20000 caracteres e recusada');
SELECT throws_ok(
  $$INSERT INTO public.patients (record_number, photo, photo_thumb) VALUES (4, '', 'data:image/jpeg;base64,/9j/BB==')$$,
  '23514', NULL, 'miniatura sem foto e recusada');
SELECT lives_ok(
  $$UPDATE public.patients SET photo = '', photo_thumb = '' WHERE id = 'abababab-1000-4000-8000-000000000001'$$,
  'remover a foto remove a miniatura junto');

SELECT * FROM finish();
ROLLBACK;
