-- "Excluir" no app = arquivar (Lei 13.787/2018: prontuário guardado por 20 anos).
-- Um único DELETE arquiva o paciente e as consultas e desvincula a agenda; nada é apagado.
-- Rodar com: supabase test db
BEGIN;
SELECT plan(19);

INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role) VALUES
  ('eeeeeeee-0000-4000-8000-000000000001', 'del-a@teste.dev', '{}', 'authenticated', 'authenticated'),
  ('eeeeeeee-0000-4000-8000-000000000002', 'del-b@teste.dev', '{}', 'authenticated', 'authenticated');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}';

INSERT INTO public.patients (id, record_number, identification) VALUES
  ('eeeeeeee-1000-4000-8000-000000000001', 1, '{"name":"Paciente"}'),
  ('eeeeeeee-1000-4000-8000-000000000002', 2, '{"name":"Outro"}');
INSERT INTO public.visits (id, patient_id, sequence) VALUES
  ('eeeeeeee-2000-4000-8000-000000000001', 'eeeeeeee-1000-4000-8000-000000000001', 1),
  ('eeeeeeee-2000-4000-8000-000000000002', 'eeeeeeee-1000-4000-8000-000000000001', 2),
  ('eeeeeeee-2000-4000-8000-000000000003', 'eeeeeeee-1000-4000-8000-000000000002', 1),
  ('eeeeeeee-2000-4000-8000-000000000004', 'eeeeeeee-1000-4000-8000-000000000002', 2);
INSERT INTO public.appointments (id, patient_id, title, starts_at) VALUES
  ('eeeeeeee-3000-4000-8000-000000000001', 'eeeeeeee-1000-4000-8000-000000000001', 'Retorno', now());

-- Cliente não escolhe deleted_at.
INSERT INTO public.patients (id, record_number, identification, deleted_at) VALUES ('eeeeeeee-1000-4000-8000-000000000009', 9, '{"name":"Esperto"}', '2000-01-01');
SELECT is((SELECT deleted_at FROM public.patients WHERE id = 'eeeeeeee-1000-4000-8000-000000000009'), NULL, 'cadastro nao nasce arquivado');
SELECT throws_ok(
  $$UPDATE public.patients SET deleted_at = '2000-01-01' WHERE id = 'eeeeeeee-1000-4000-8000-000000000009'$$,
  '42501', NULL, 'dentista nao arquiva com data inventada via UPDATE');

-- Outro dentista tenta excluir: nada acontece.
SET LOCAL request.jwt.claims = '{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}';
DELETE FROM public.patients WHERE id = 'eeeeeeee-1000-4000-8000-000000000001';
DELETE FROM public.visits WHERE id = 'eeeeeeee-2000-4000-8000-000000000003';

SET LOCAL request.jwt.claims = '{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}';
SELECT is((SELECT count(*) FROM public.patients)::int, 3, 'tentativa alheia nao arquiva pacientes');
SELECT is((SELECT count(*) FROM public.visits)::int, 4, 'tentativa alheia nao arquiva consultas');

-- Dono "exclui" uma consulta: some do app, continua no banco.
DELETE FROM public.visits WHERE id = 'eeeeeeee-2000-4000-8000-000000000004';
SELECT is((SELECT count(*) FROM public.visits WHERE patient_id = 'eeeeeeee-1000-4000-8000-000000000002')::int, 1, 'consulta excluida some do app');
INSERT INTO public.visits (id, patient_id, sequence) VALUES ('eeeeeeee-2000-4000-8000-000000000005', 'eeeeeeee-1000-4000-8000-000000000002', 2);
SELECT is((SELECT sequence FROM public.visits WHERE id = 'eeeeeeee-2000-4000-8000-000000000005'), 3, 'numero da consulta arquivada nao e reaproveitado');

-- Dono "exclui" o paciente: um único DELETE.
DELETE FROM public.patients WHERE id = 'eeeeeeee-1000-4000-8000-000000000001';
SELECT is((SELECT count(*) FROM public.patients WHERE id = 'eeeeeeee-1000-4000-8000-000000000001')::int, 0, 'paciente excluido some do app');
SELECT is((SELECT count(*) FROM public.visits WHERE patient_id = 'eeeeeeee-1000-4000-8000-000000000001')::int, 0, 'consultas dele somem do app');
SELECT ok((SELECT patient_id IS NULL FROM public.appointments WHERE id = 'eeeeeeee-3000-4000-8000-000000000001'), 'horario da agenda continua, sem o vinculo');
SELECT throws_ok(
  $$INSERT INTO public.visits (patient_id, sequence) VALUES ('eeeeeeee-1000-4000-8000-000000000001', 3)$$,
  '42501', NULL, 'nao cria consulta em paciente arquivado');
SELECT is_empty(
  $$UPDATE public.patients SET identification = '{"name":"mexido"}' WHERE id = 'eeeeeeee-1000-4000-8000-000000000001' RETURNING id$$,
  'paciente arquivado nao pode ser editado');

INSERT INTO public.patients (id, record_number, identification) VALUES ('eeeeeeee-1000-4000-8000-000000000003', 1, '{"name":"Novo"}');
SELECT is((SELECT record_number FROM public.patients WHERE id = 'eeeeeeee-1000-4000-8000-000000000003'), 10, 'Nº do arquivado nao e reaproveitado');

-- No banco, tudo continua guardado.
RESET ROLE;
SELECT is((SELECT count(*) FROM public.patients WHERE owner_id = 'eeeeeeee-0000-4000-8000-000000000001')::int, 4, 'nenhum paciente apagado de verdade');
SELECT is((SELECT count(*) FROM public.visits WHERE owner_id = 'eeeeeeee-0000-4000-8000-000000000001')::int, 5, 'nenhuma consulta apagada de verdade');
SELECT ok((SELECT deleted_at IS NOT NULL FROM public.patients WHERE id = 'eeeeeeee-1000-4000-8000-000000000001'), 'paciente marcado como arquivado');
SELECT is((SELECT count(*) FROM public.visits WHERE patient_id = 'eeeeeeee-1000-4000-8000-000000000001' AND deleted_at IS NOT NULL)::int, 2, 'consultas do paciente arquivadas junto');
SELECT ok((SELECT deleted_at IS NOT NULL FROM public.visits WHERE id = 'eeeeeeee-2000-4000-8000-000000000004'), 'consulta marcada como arquivada');
SELECT throws_ok(
  $$UPDATE public.patients SET deleted_at = NULL WHERE id = 'eeeeeeee-1000-4000-8000-000000000001'$$,
  '42501', NULL, 'data de arquivamento nao muda depois de gravada');
SELECT ok(NOT has_function_privilege('authenticated', 'private.archive_patient_instead_of_delete()', 'EXECUTE'), 'funcao de arquivamento fechada para authenticated');

SELECT * FROM finish();
ROLLBACK;
