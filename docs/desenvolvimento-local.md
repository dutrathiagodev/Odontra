# Desenvolvimento local (banco de testes)

O banco de testes fica **neste mesmo repositório**: é o Supabase rodando no Docker da sua máquina,
montado só a partir de `supabase/migrations/` e preenchido por `supabase/seed.sql`. Nada aqui toca a produção.

## Primeira vez

1. Docker aberto e Node 24 (`nvm use 24`).
2. `npm install`
3. `npm run db:start` — sobe o Supabase local (Postgres, Auth, e-mails de teste).
4. Copie `.env.example` para `.env.local` e preencha com o que `npm run db:status` mostrar
   (`API_URL` → `NEXT_PUBLIC_SUPABASE_URL`, `PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
5. `npm run dev` e abra http://localhost:3000

## Conta de teste

| E-mail | Senha |
|---|---|
| `dentista@odontra.test` | `Odontra12345` |

Ela já vem com uma semana de horários na agenda. Para ter pacientes, use **Carregar exemplos** na tela de pacientes.
Essa conta só existe no banco local.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run db:start` / `db:stop` | Liga e desliga o banco local |
| `npm run db:reset` | Apaga tudo e recria do zero (migrations + seed). Use antes de subir qualquer migration |
| `npm run db:test` | Roda os testes de segurança (RLS) em `supabase/tests/` |
| `npm run db:status` | Mostra endereços e chaves locais |

E-mails enviados pelo Auth local (recuperar senha etc.) aparecem no Mailpit: http://127.0.0.1:54324

## Regra das migrations

1. `supabase migration new <nome>` → escreva o SQL.
2. `npm run db:reset` e `npm run db:test` passando.
3. Só então, com aprovação, `supabase db push` para o projeto remoto. Nunca editar migration já aplicada.
