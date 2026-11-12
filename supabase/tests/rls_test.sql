-- Testes de RLS do Odontra: cada dentista só acessa os próprios dados.
-- Rodar com: supabase test db
BEGIN;
SELECT plan(14);

-- Dois dentistas (o trigger cria os perfis).
INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'a@teste.dev', '{"full_name":"Dra. A"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'b@teste.dev', '{"full_name":"Dr. B"}', 'authenticated', 'authenticated');

SELECT is((SELECT count(*) FROM public.profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'))::int, 2, 'trigger cria um perfil por usuario');
SELECT is((SELECT full_name FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111'), 'Dra. A', 'perfil recebe o nome do cadastro');

-- Dentista A cria paciente e consulta.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

SELECT lives_ok($$INSERT INTO public.patients (id, record_number, identification) VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 1, '{"name":"Paciente da A","cpf":"123"}')$$, 'A cria paciente');
SELECT lives_ok($$INSERT INTO public.visits (id, patient_id, sequence) VALUES ('aaaaaaaa-0000-0000-0000-0000000000a1', 'aaaaaaaa-0000-0000-0000-000000000001', 1)$$, 'A cria consulta no proprio paciente');
SELECT is((SELECT count(*) FROM public.patients)::int, 1, 'A ve o proprio paciente');
SELECT is((SELECT owner_id FROM public.patients LIMIT 1), '11111111-1111-1111-1111-111111111111'::uuid, 'owner_id vem do JWT');

-- Dentista B tenta acessar dados de A.
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

SELECT is((SELECT count(*) FROM public.patients)::int, 0, 'B nao ve pacientes de A');
SELECT is((SELECT count(*) FROM public.visits)::int, 0, 'B nao ve consultas de A');
SELECT is((SELECT count(*) FROM public.profiles)::int, 1, 'B ve apenas o proprio perfil');
SELECT throws_ok(
  $$INSERT INTO public.visits (patient_id, sequence) VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 2)$$,
  '42501', NULL, 'B nao cria consulta em paciente de A');
SELECT throws_ok(
  $$INSERT INTO public.patients (owner_id, record_number) VALUES ('11111111-1111-1111-1111-111111111111', 9)$$,
  '42501', NULL, 'B nao cria paciente em nome de A');

UPDATE public.patients SET identification = '{"name":"hackeado"}' WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';
DELETE FROM public.patients WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- Visitante anônimo.
SET LOCAL ROLE anon;
SET LOCAL request.jwt.claims = '{"role":"anon"}';
SELECT throws_ok('SELECT * FROM public.patients', '42501', NULL, 'anon nao tem acesso a patients');

RESET ROLE;
SELECT is((SELECT identification ->> 'name' FROM public.patients WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001'), 'Paciente da A', 'update e delete de B nao afetaram o paciente de A');
SELECT ok(NOT has_function_privilege('authenticated', 'private.handle_new_user()', 'EXECUTE'), 'funcao interna fechada para authenticated');

SELECT * FROM finish();
ROLLBACK;
