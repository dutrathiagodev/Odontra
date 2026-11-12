BEGIN;
SELECT plan(6);

INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'agenda-a@teste.dev', '{"full_name":"Dra. A"}', 'authenticated', 'authenticated'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'agenda-b@teste.dev', '{"full_name":"Dr. B"}', 'authenticated', 'authenticated');

-- Paciente do dentista B.
INSERT INTO public.patients (id, owner_id, record_number, identification, anamnesis)
VALUES ('bbbbbbbb-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000002', 1, '{"name":"Paciente do B"}', '{}');

SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}';

SELECT lives_ok(
  $$INSERT INTO public.appointments (title, starts_at) VALUES ('Consulta A', now())$$,
  'dentista marca horário na própria agenda'
);

SELECT is((SELECT owner_id FROM public.appointments WHERE title = 'Consulta A'), 'aaaaaaaa-0000-4000-8000-000000000001'::uuid, 'dono vem do auth.uid()');

SELECT throws_ok(
  $$INSERT INTO public.appointments (title, starts_at, patient_id) VALUES ('Invasão', now(), 'bbbbbbbb-0000-4000-8000-000000000002')$$,
  '42501', NULL,
  'não vincula paciente de outro dentista'
);

SELECT throws_ok(
  $$INSERT INTO public.appointments (owner_id, title, starts_at) VALUES ('aaaaaaaa-0000-4000-8000-000000000002', 'Na agenda do B', now())$$,
  '42501', NULL,
  'não grava na agenda de outro dentista'
);

SET LOCAL request.jwt.claims = '{"sub":"aaaaaaaa-0000-4000-8000-000000000002","role":"authenticated"}';
SELECT is((SELECT count(*) FROM public.appointments WHERE title = 'Consulta A')::int, 0, 'outro dentista não vê a agenda');

RESET role;
SET LOCAL role anon;
SELECT throws_ok($$SELECT 1 FROM public.appointments$$, '42501', NULL, 'anônimo não acessa a agenda');

SELECT * FROM finish();
ROLLBACK;
