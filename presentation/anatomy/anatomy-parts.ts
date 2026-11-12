export type PartKey = "enamel" | "dentin" | "pulp" | "cementum" | "ligament" | "bone" | "gum" | "nerve";

export interface AnatomyPart {
  key: PartKey;
  label: string;
  summary: string;
  detail: string;
  /** Lado e altura (0–100) do rótulo, e ponto de ancoragem no desenho (viewBox 420×430). */
  side: "left" | "right";
  labelTop: number;
  anchor: [number, number];
}

export const ANATOMY_PARTS: readonly AnatomyPart[] = [
  { key: "enamel", label: "Esmalte", side: "left", labelTop: 9, anchor: [138, 70], summary: "A camada mais dura do corpo.", detail: "Reveste a coroa e protege o dente do desgaste e dos ácidos. Não tem células vivas, por isso não se regenera: o flúor ajuda a fortalecê-lo." },
  { key: "dentin", label: "Dentina", side: "left", labelTop: 27, anchor: [150, 150], summary: "O “miolo” amarelado do dente.", detail: "Forma a maior parte do dente, sob o esmalte e o cemento. Tem microtúbulos que levam estímulos (frio, calor, doce) até a polpa, o que explica a sensibilidade." },
  { key: "gum", label: "Gengiva", side: "left", labelTop: 46, anchor: [150, 224], summary: "Tecido rosado que envolve o colo do dente.", detail: "Protege o osso e a raiz. Sangramento ao escovar, vermelhidão e inchaço são sinais de gengivite." },
  { key: "cementum", label: "Cemento", side: "left", labelTop: 64, anchor: [164, 290], summary: "Capa fina sobre a raiz.", detail: "Cobre a raiz e é onde as fibras do ligamento periodontal se prendem, ancorando o dente ao osso." },
  { key: "bone", label: "Osso alveolar", side: "left", labelTop: 82, anchor: [130, 360], summary: "Osso que sustenta o dente.", detail: "Parte da mandíbula ou da maxila que forma o “alvéolo”, o encaixe da raiz. Perde volume na doença periodontal avançada." },
  { key: "pulp", label: "Polpa", side: "right", labelTop: 17, anchor: [210, 110], summary: "O centro vivo do dente.", detail: "Contém nervos, vasos sanguíneos e tecido conjuntivo. Nutre o dente e dá sensibilidade. Cárie profunda pode inflamá-la, causando dor e podendo exigir tratamento de canal." },
  { key: "ligament", label: "Ligamento periodontal", side: "right", labelTop: 54, anchor: [256, 300], summary: "Fibras que seguram o dente.", detail: "Liga o cemento ao osso alveolar e funciona como amortecedor durante a mastigação. É ele que permite o dente se movimentar no aparelho ortodôntico." },
  { key: "nerve", label: "Nervo e vasos", side: "right", labelTop: 86, anchor: [212, 400], summary: "A “entrada” do dente.", detail: "Nervos e vasos entram pela ponta da raiz (forame apical) e seguem pelo canal até a polpa, levando sangue e sensibilidade." },
];
