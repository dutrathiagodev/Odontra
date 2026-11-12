/**
 * Conteúdo editável da landing page.
 * Para usar fotos reais, coloque os arquivos em `public/images/` e preencha `image`
 * (ex.: "/images/hero.jpg"). Sem `image`, a seção mostra uma ilustração.
 */
export const HERO = {
  image: "",
  stats: [
    { value: "32", label: "Dentes no odontograma" },
    { value: "8", label: "Condições clínicas" },
    { value: "A4", label: "PDF pronto para imprimir" },
  ],
};

export const EXPERTISE = [
  { title: "Odontograma", text: "Toque no dente e registre a condição.", href: "/painel", art: "odontogram" as const, image: "" },
  { title: "Prontuário em PDF", text: "Baixe ou imprima em A4.", href: "/painel", art: "pdf" as const, image: "" },
  { title: "Histórico do paciente", text: "Cada consulta, uma evolução.", href: "/painel", art: "history" as const, image: "" },
];

export const WHY = {
  image: "",
  items: [
    { icon: "tooth" as const, title: "Odontograma moderno", text: "Condições por cores e observação em cada dente." },
    { icon: "heart" as const, title: "Simples de usar", text: "Formulários curtos, feitos para o celular." },
    { icon: "shield" as const, title: "Dados no seu aparelho", text: "As informações ficam salvas neste dispositivo." },
  ],
};

export const SERVICES = [
  { icon: "users" as const, label: "Cadastro de pacientes" },
  { icon: "clipboard" as const, label: "Anamnese completa" },
  { icon: "tooth" as const, label: "Odontograma interativo" },
  { icon: "history" as const, label: "Histórico de consultas" },
  { icon: "camera" as const, label: "Foto do paciente" },
  { icon: "pdf" as const, label: "PDF e impressão" },
];
