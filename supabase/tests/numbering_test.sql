BEGIN;
SELECT plan(5);

INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role) VALUES
  ('cccccccc-0000-4000-8000-000000000001', 'num-a@teste.dev', '{}', 'authenticated', 'authenticated'),
  ('cccccccc-0000-4000-8000-000000000002', 'num-b@teste.dev', '{}', 'authenticated', 'authenticated');

SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub":"cccccccc-0000-4000-8000-000000000001","role":"authenticated"}';

INSERT INTO public.patients (id, record_number, identification) VALUES ('dddddddd-0000-4000-8000-000000000001', 1, '{"name":"P1"}');
-- Outro aparelho tenta o mesmo Nº 1: o banco dá o próximo.
INSERT INTO public.patients (id, record_number, identification) VALUES ('dddddddd-0000-4000-8000-000000000002', 1, '{"name":"P2"}');
SELECT is((SELECT record_number FROM public.patients WHERE id = 'dddddddd-0000-4000-8000-000000000002'), 2, 'Nº repetido vira o próximo número');

-- Salvar de novo (upsert) não muda o número de quem já existe.
INSERT INTO public.patients (id, record_number, identification) VALUES ('dddddddd-0000-4000-8000-000000000001', 1, '{"name":"P1 editado"}')
  ON CONFLICT (id) DO UPDATE SET identification = excluded.identification, record_number = excluded.record_number;
SELECT is((SELECT record_number FROM public.patients WHERE id = 'dddddddd-0000-4000-8000-000000000001'), 1, 'editar mantém o número');

INSERT INTO public.visits (id, patient_id, sequence) VALUES ('eeeeeeee-0000-4000-8000-000000000001', 'dddddddd-0000-4000-8000-000000000001', 1);
INSERT INTO public.visits (id, patient_id, sequence) VALUES ('eeeeeeee-0000-4000-8000-000000000002', 'dddddddd-0000-4000-8000-000000000001', 1);
SELECT is((SELECT sequence FROM public.visits WHERE id = 'eeeeeeee-0000-4000-8000-000000000002'), 2, 'consulta repetida vira a próxima');

-- Outro dentista começa do 1 (numeração separada, sem ver os números do primeiro).
SET LOCAL request.jwt.claims = '{"sub":"cccccccc-0000-4000-8000-000000000002","role":"authenticated"}';
INSERT INTO public.patients (id, record_number, identification) VALUES ('dddddddd-0000-4000-8000-000000000003', 0, '{"name":"Q1"}');
SELECT is((SELECT record_number FROM public.patients WHERE id = 'dddddddd-0000-4000-8000-000000000003'), 1, 'cada dentista tem a própria numeração');

SELECT throws_ok($$SELECT private.assign_record_number()$$, '42501', NULL, 'função interna não é chamável pelo app');

SELECT * FROM finish();
ROLLBACK;
