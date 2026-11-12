# Arquitetura

O projeto segue Clean Architecture. A regra de dependência é: **camadas externas dependem das internas, nunca o contrário**.

```
presentation / app  ──►  application  ──►  domain
        │                     ▲
        └──► infrastructure ──┘ (implementa as interfaces do domain)
```

## Camadas

| Pasta | Responsabilidade | Pode importar |
|---|---|---|
| `domain/` | Entidades e contratos (interfaces de repositório). Sem framework. | nada |
| `application/` | Casos de uso (uma classe por ação, método `execute`). | `domain` |
| `infrastructure/` | Implementações concretas (banco, APIs) e o composition root (`container.ts`). | `domain`, `application` |
| `presentation/` | Componentes React e hooks de UI. | `domain`, `application` (tipos) |
| `app/` | Rotas Next.js. Só orquestra: chama casos de uso e renderiza componentes. | todas |

## Convenções de clean code

- Uma responsabilidade por arquivo; nomes que dizem a intenção.
- Casos de uso recebem dependências pelo construtor (inversão de dependência).
- Trocar a persistência = criar nova implementação de `PatientRepository` e alterar só `infrastructure/container.ts`.
- Funções pequenas, sem comentários que repitam o código; comente apenas o "porquê".
- Entidades imutáveis (`readonly`).

## Como adicionar uma feature

1. Modele a entidade e o contrato em `domain/<feature>/`.
2. Crie o caso de uso em `application/<feature>/`.
3. Implemente o repositório em `infrastructure/<feature>/` e registre no `container.ts`.
4. Crie os componentes em `presentation/components/` e use-os na rota em `app/`.
