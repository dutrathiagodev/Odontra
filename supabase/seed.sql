-- Dados de teste do banco LOCAL (roda só no `supabase db reset`; nunca vai para produção).
-- Conta de teste: dentista@odontra.test / Odontra12345 (só existe no Docker local).

do $$
declare
  uid uuid := '11111111-1111-4111-8111-111111111111';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
    'dentista@odontra.test', extensions.crypt('Odontra12345', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Dra. Maju Teste"}', now(), now(),
    '', '', '', ''
  ) on conflict (id) do nothing;

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    uid, uid, uid::text,
    jsonb_build_object('sub', uid::text, 'email', 'dentista@odontra.test', 'email_verified', true),
    'email', now(), now(), now()
  ) on conflict do nothing;

  update public.profiles set cro = 'CRO-SP 00000' where id = uid;

  -- Uma semana de horários a partir de hoje, para a agenda não abrir vazia.
  insert into public.appointments (owner_id, title, starts_at, duration_minutes, notes) values
    (uid, 'Consulta — Ana Souza',    date_trunc('day', now()) + interval '9 hours',              30, 'Retorno da restauração do 26.'),
    (uid, 'Limpeza — Bruno Lima',    date_trunc('day', now()) + interval '10 hours 30 minutes',  45, ''),
    (uid, 'Canal — Carla Mendes',    date_trunc('day', now()) + interval '1 day 14 hours',       90, 'Segunda sessão.'),
    (uid, 'Avaliação — Diego Rocha', date_trunc('day', now()) + interval '2 days 8 hours',       30, 'Primeira consulta.'),
    (uid, 'Clareamento — Eva Nunes', date_trunc('day', now()) + interval '4 days 16 hours',      60, '');
end $$;
