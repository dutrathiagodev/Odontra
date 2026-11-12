-- CPF cifrado: sai do JSON, fica cifrado, só o dono lê pela RPC. Rodar com: supabase test db
BEGIN;
SELECT plan(17);

INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role) VALUES
  ('cdcdcdcd-0000-4000-8000-000000000001', 'cpf-a@teste.dev', '{}', 'authenticated', 'authenticated'),
  ('cdcdcdcd-0000-4000-8000-000000000002', 'cpf-b@teste.dev', '{}', 'authenticated', 'authenticated');

SELECT ok(EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'odontra_cpf_key'), 'chave do CPF existe no Vault');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"cdcdcdcd-0000-4000-8000-000000000001","role":"authenticated"}';

INSERT INTO public.patients (id, record_number, identification)
VALUES ('cdcdcdcd-1000-4000-8000-000000000001', 1, '{"name":"Com CPF","cpf":"123.456.789-00"}');

SELECT is((SELECT identification ->> 'cpf' FROM public.patients WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001'), '', 'CPF sai do JSON');
SELECT is((SELECT cpf_masked FROM public.patients WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001'), '***.456.789-**', 'CPF mascarado para a lista');
SELECT ok((SELECT cpf_encrypted IS NOT NULL FROM public.patients WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001'), 'CPF gravado cifrado');
SELECT ok((SELECT position('123.456.789-00' in encode(cpf_encrypted, 'escape')) = 0 FROM public.patients WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001'), 'coluna cifrada nao contem o CPF em texto');
SELECT is(public.get_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001'), '123.456.789-00', 'dono le o CPF pela RPC');

-- Editar outros campos sem mandar "cpf" não apaga o CPF.
UPDATE public.patients SET identification = '{"name":"Com CPF editado"}' WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001';
SELECT is(public.get_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001'), '123.456.789-00', 'sem "cpf" no JSON o CPF continua');

-- Cliente não grava as colunas do CPF direto.
UPDATE public.patients SET cpf_masked = 'falso', cpf_encrypted = '\x00' WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001';
SELECT is(public.get_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001'), '123.456.789-00', 'colunas do CPF nao sao gravadas pelo cliente');

-- Trocar e apagar.
UPDATE public.patients SET identification = '{"name":"X","cpf":"98765432100"}' WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001';
SELECT is(public.get_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001'), '98765432100', 'trocar o CPF');
UPDATE public.patients SET identification = '{"name":"X","cpf":""}' WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001';
SELECT is(public.get_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001'), NULL, '"cpf" vazio apaga o CPF');
SELECT is((SELECT cpf_masked FROM public.patients WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001'), '', 'mascara some junto');

UPDATE public.patients SET identification = '{"name":"X","cpf":"111.222.333-44"}' WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001';

-- Outro dentista.
SET LOCAL request.jwt.claims = '{"sub":"cdcdcdcd-0000-4000-8000-000000000002","role":"authenticated"}';
SELECT is(public.get_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001'), NULL, 'outro dentista nao le o CPF pela RPC');
SELECT is(private.decrypt_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001'), NULL, 'nem chamando a funcao interna direto');
SELECT throws_ok('SELECT private.cpf_key()', '42501', NULL, 'authenticated nao le a chave');
SELECT throws_ok('SELECT * FROM vault.decrypted_secrets', '42501', NULL, 'authenticated nao le o Vault');

-- Paciente arquivado: nem o dono lê mais pelo app.
SET LOCAL request.jwt.claims = '{"sub":"cdcdcdcd-0000-4000-8000-000000000001","role":"authenticated"}';
DELETE FROM public.patients WHERE id = 'cdcdcdcd-1000-4000-8000-000000000001';
SELECT is(public.get_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001'), NULL, 'paciente arquivado nao devolve CPF');

SET LOCAL ROLE anon;
SET LOCAL request.jwt.claims = '{"role":"anon"}';
SELECT throws_ok($$SELECT public.get_patient_cpf('cdcdcdcd-1000-4000-8000-000000000001')$$, '42501', NULL, 'anon nao chama a RPC');

SELECT * FROM finish();
ROLLBACK;
