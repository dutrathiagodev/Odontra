import { PanelShell } from "@/presentation/panel/panel-shell";
import { PrintSheetHost } from "@/presentation/pdf/print-sheet";

export default function PanelLayout({ children }: LayoutProps<"/painel">) {
  return (
    <PanelShell>
      {children}
      <PrintSheetHost />
    </PanelShell>
  );
}
