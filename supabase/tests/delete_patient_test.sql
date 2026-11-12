-- Exclusão do paciente: um único DELETE leva as consultas junto (cascata)
-- e só desvincula os horários da agenda. Rodar com: supabase test db
BEGIN;
SELECT plan(6);

INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role) VALUES
  ('eeeeeeee-0000-4000-8000-000000000001', 'del-a@teste.dev', '{}', 'authenticated', 'authenticated'),
  ('eeeeeeee-0000-4000-8000-000000000002', 'del-b@teste.dev', '{}', 'authenticated', 'authenticated');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}';

INSERT INTO public.patients (id, record_number, identification) VALUES ('eeeeeeee-1000-4000-8000-000000000001', 1, '{"name":"Paciente"}');
INSERT INTO public.visits (id, patient_id, sequence) VALUES
  ('eeeeeeee-2000-4000-8000-000000000001', 'eeeeeeee-1000-4000-8000-000000000001', 1),
  ('eeeeeeee-2000-4000-8000-000000000002', 'eeeeeeee-1000-4000-8000-000000000001', 2);
INSERT INTO public.appointments (id, patient_id, title, starts_at) VALUES
  ('eeeeeeee-3000-4000-8000-000000000001', 'eeeeeeee-1000-4000-8000-000000000001', 'Retorno', now());

-- Outro dentista tenta excluir: nada acontece.
SET LOCAL request.jwt.claims = '{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}';
SELECT is_empty($$DELETE FROM public.patients WHERE id = 'eeeeeeee-1000-4000-8000-000000000001' RETURNING id$$, 'outro dentista nao exclui o paciente');

SET LOCAL request.jwt.claims = '{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}';
SELECT is((SELECT count(*) FROM public.visits)::int, 2, 'consultas continuam depois da tentativa alheia');

SELECT results_eq(
  $$DELETE FROM public.patients WHERE id = 'eeeeeeee-1000-4000-8000-000000000001' RETURNING id$$,
  $$VALUES ('eeeeeeee-1000-4000-8000-000000000001'::uuid)$$,
  'dono exclui o paciente num unico DELETE');
SELECT is((SELECT count(*) FROM public.visits)::int, 0, 'consultas saem junto por cascata');
SELECT is((SELECT count(*) FROM public.appointments)::int, 1, 'horario da agenda continua');
SELECT ok((SELECT patient_id IS NULL FROM public.appointments WHERE id = 'eeeeeeee-3000-4000-8000-000000000001'), 'horario perde so o vinculo com o paciente');

SELECT * FROM finish();
ROLLBACK;
