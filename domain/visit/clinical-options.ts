/** Opções do exame clínico: uma fonte só para o formulário, a ficha e o PDF. */
export type Option = readonly [value: string, label: string];

export const CLINICAL_OPTIONS = {
  hygiene: [["normal", "Normal"], ["regular", "Regular"], ["bad", "Ruim"]],
  halitosis: [["absent", "Ausente"], ["moderate", "Moderada"], ["strong", "Forte"]],
  tartar: [["absent", "Ausente"], ["little", "Pouco"], ["much", "Muito"]],
  gingiva: [["normal", "Normal"], ["gingivitis", "Gengivite"], ["periodontitis", "Periodontite"]],
  mucosa: [["normal", "Normal"], ["altered", "Alterada"]],
} as const satisfies Record<string, readonly Option[]>;

/** Formato { value, label } usado pelos campos de escolha da tela. */
export const toChoices = <V extends string>(options: readonly (readonly [V, string])[]) => options.map(([value, label]) => ({ value, label }));
