## Card do Trello

<!-- Ex.: Odontra/00012. A branch segue o mesmo id: Odontra/00012-descricao-curta. -->

Odontra/

## O que mudou

<!-- Em uma ou duas frases, para quem não viu o código. -->

## Como testar

<!-- Passos curtos para conferir a mudança (tela, usuário de teste, dados). -->

1.

## Checklist

### Qualidade

- [ ] PR aponta para a `develop` (só a entrega `develop` -> `main` vai para a `main`)
- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam
- [ ] Regra de negócio nova tem teste
- [ ] Conferido no navegador (claro e escuro, desktop e celular, quando houver tela)
- [ ] Sem `Co-authored-by` de ferramenta nem assinatura "Generated with" nos commits

### Segurança

- [ ] Sem segredo no código (chaves só em `.env.local` ou nos secrets; nada de chave de servidor com `NEXT_PUBLIC_`)
- [ ] Entrada validada e permissão conferida no servidor, não só na tela
- [ ] Dados de paciente: só o necessário, nada em log, URL ou query string
- [ ] Tabela nova ou alterada tem RLS ligada e políticas que limitam ao dono dos dados

### Banco (só se mexeu em `supabase/`)

- [ ] Migration criada com `supabase migration new <nome>` (nunca à mão com timestamp inventado)
- [ ] Nenhuma migration já aplicada foi editada: correção é sempre uma migration nova
- [ ] `npm run db:reset` roda do zero sem erro
- [ ] `npm run db:test` passa (incluindo os testes de RLS)
