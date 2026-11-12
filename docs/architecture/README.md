# Arquitetura

O Odontra segue Clean Architecture. A regra de dependência: **camadas externas dependem das internas, nunca o contrário**.

```
app (rotas) ─► presentation ─► application ─► domain
                    │                ▲
                    └─► infrastructure ┘  (implementa as interfaces do domain)
```

## Camadas

| Pasta | Responsabilidade | Pode importar |
|---|---|---|
| `domain/` | Entidades (`Patient`, `Visit`, `Odontogram`), fábricas e contratos de repositório. Sem framework. | nada |
| `application/` | Casos de uso (uma classe por ação, método `execute`). | `domain` |
| `infrastructure/` | Implementações concretas (hoje `localStorage`) e o composition root `container.ts`. | `domain`, `application` |
| `presentation/` | Componentes React, hooks, odontograma, PDF, landing. | `domain`, `infrastructure/container` |
| `app/` | Rotas Next.js. Só compõem componentes de `presentation`. | todas |

## Modelo

- **Patient**: identificação, foto, anamnese, antecedentes familiares. Nº do prontuário sequencial.
- **Visit** (consulta): pertence a um paciente; saúde bucal, exame clínico, odontograma e procedimentos. É o **histórico** do paciente.
- **Odontogram**: `Record<dente FDI, { condition, note }>`. Uma nova consulta herda o odontograma e o profissional da anterior.

## Fluxos principais

- `/` landing · `/painel` lista de pacientes · `/painel/pacientes/[id]` ficha (dados, anamnese, histórico)
- `/painel/pacientes/[id]/consultas/[visitId]` consulta: odontograma clicável, **Gerar PDF** e **Imprimir**
- PDF (`presentation/pdf`): `@react-pdf/renderer`, A4, carregado sob demanda; QR code do site no rodapé.

## Convenções de clean code

- Uma responsabilidade por arquivo; nomes que dizem a intenção.
- Casos de uso recebem dependências pelo construtor.
- Trocar a persistência (API/banco) = nova implementação dos repositórios + alterar só `infrastructure/container.ts`.
- Entidades de domínio sem dependência de React/Next.
- Mobile first: alvos de toque ≥ 44px, formulários curtos, ações na base da tela.

## Roadmap

- **App nativo** (futuro): reaproveitar `domain/` e `application/` (TypeScript puro) em React Native/Expo; hoje o painel já é instalável como PWA (`app/manifest.ts`).
- Backend/sincronização entre dispositivos (hoje os dados ficam só no aparelho).
- Imagens e documentos do paciente (raio-x, exames), assinatura eletrônica, orçamentos.
- `NEXT_PUBLIC_SITE_URL` no deploy para o QR code apontar para o domínio final.
