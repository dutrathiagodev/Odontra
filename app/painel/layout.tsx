import { PanelShell } from "@/presentation/panel/panel-shell";

export default function PanelLayout({ children }: LayoutProps<"/painel">) {
  return <PanelShell>{children}</PanelShell>;
}
