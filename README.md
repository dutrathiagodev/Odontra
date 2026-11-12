<h1 align="center">
  <img src="docs/assets/logo-badge.png" alt="Odontra" width="64" valign="middle" /> Odontra
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-3b82f6?style=flat&labelColor=071b3f" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-3b82f6?style=flat&labelColor=071b3f" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3b82f6?style=flat&labelColor=071b3f" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-v4-3b82f6?style=flat&labelColor=071b3f" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/mobile-first-3b82f6?style=flat&labelColor=071b3f" alt="Mobile first" />
  <img src="https://img.shields.io/badge/arquitetura-limpa-3b82f6?style=flat&labelColor=071b3f" alt="Clean Architecture" />
</p>

<p align="center">
  <strong>Seu painel odontológico, na palma da mão.</strong><br/>
  Cadastre pacientes com foto, marque os dentes com um toque e gere o prontuário em PDF pronto para imprimir.
</p>

<p align="center">
  <img src="docs/assets/landing-desktop.jpg" alt="Landing page do Odontra" width="860" />
</p>

## Recursos

<table>
<tr>
<td width="46%" valign="middle">

### Odontograma de toque

Os 32 dentes na tela, coloridos por condição: cárie, restauração, coroa, endodontia, implante, ausente e extração indicada. Toque no dente, escolha a condição e escreva uma observação.

</td>
<td width="54%" align="center">
  <img src="docs/assets/dente-mobile.jpg" alt="Editor do dente no celular" width="300" />
</td>
</tr>
<tr>
<td width="46%" valign="middle">

### Paciente com histórico

Ficha com foto (câmera ou galeria), identificação e anamnese completa. Cada consulta vira uma evolução clínica, e a próxima já parte do odontograma anterior. Alergia, gestação e medicação aparecem em destaque antes do atendimento.

</td>
<td width="54%" align="center">
  <img src="docs/assets/pacientes-mobile.jpg" alt="Lista de pacientes no celular" width="300" />
</td>
</tr>
<tr>
<td width="46%" valign="middle">

### Anatomia do dente interativa

Toque no esmalte, na dentina, na polpa, no cemento, na gengiva e no osso para ver o que cada parte faz. Ligue e desligue camadas, revele o interior e use o tour automático para explicar o tratamento ao paciente.

</td>
<td width="54%" align="center">
  <img src="docs/assets/anatomia-mobile.jpg" alt="Anatomia interativa do dente" width="300" />
</td>
</tr>
<tr>
<td width="46%" valign="middle">

### PDF e impressão em um toque

Prontuário em A4 no modelo clássico: identificação, anamnese, saúde bucal, exame clínico, odontograma colorido, procedimentos, assinatura e QR code do sistema no rodapé.

</td>
<td width="54%" align="center">
  <img src="docs/assets/pdf-pagina-2.jpg" alt="Página do prontuário em PDF" width="100%" />
</td>
</tr>
</table>

- **Feito para o celular:** botões grandes, abas roláveis, ações na base da tela e editor de dente em painel deslizante. Instalável na tela inicial como app (PWA).
- **Landing animada e interativa:** hero com janela 3D que responde ao cursor, odontograma clicável, tour do produto que troca de cena sozinho e seções que surgem ao rolar. Respeita `prefers-reduced-motion`.
- **Pacientes de exemplo:** um botão no painel vazio cria pacientes fictícios com fotos de perfil sorteadas, para ver tudo funcionando em segundos.
- **Privacidade:** os dados ficam no próprio aparelho (`localStorage`). Nada é enviado para servidor.

<p align="center">
  <img src="docs/assets/landing-mobile.jpg" alt="Landing no celular" width="260" />
  &nbsp;&nbsp;
  <img src="docs/assets/tour-mobile.jpg" alt="Tour do produto no celular" width="260" />
</p>

## Como rodar

Requer Node.js 20.9 ou mais novo.

```bash
git clone https://github.com/dutrathiagodev/Odontra.git
cd Odontra
npm install
npm run dev
```

Abra `http://localhost:3000`. O painel fica em `/painel`.

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Sobe o build de produção |
| `npm run lint` | ESLint |

<details>
<summary>Variáveis de ambiente</summary>

| Variável | Para que serve |
|----------|----------------|
| `NEXT_PUBLIC_SITE_URL` | Endereço público do site. O QR code da landing e do PDF aponta para ele. Sem ela, usa o endereço atual do navegador. |

</details>

## Arquitetura

Clean Architecture, com a regra de dependência sempre apontando para dentro:

```
app (rotas) ─► presentation ─► application ─► domain
                    │                ▲
                    └─► infrastructure ┘
```

| Pasta | O que tem |
|-------|-----------|
| `domain/` | Entidades (`Patient`, `Visit`, `Odontogram`), fábricas e contratos de repositório. TypeScript puro. |
| `application/` | Casos de uso, um por arquivo, com método `execute`. |
| `infrastructure/` | Repositórios em `localStorage` e o composition root `container.ts`. |
| `presentation/` | Componentes React, odontograma, anatomia, PDF e landing. |
| `app/` | Rotas do Next.js (App Router). |

Trocar o armazenamento por uma API ou banco é criar novos repositórios e mudar só o `infrastructure/container.ts`. Detalhes em [docs/architecture](docs/architecture/README.md).

## Roadmap

- App nativo reaproveitando `domain/` e `application/`.
- Backend com sincronização entre dispositivos e login.
- Imagens e exames do paciente (raio-x), assinatura eletrônica e orçamentos.

## Créditos

Fotos de perfil de exemplo: [Unsplash](https://unsplash.com).
