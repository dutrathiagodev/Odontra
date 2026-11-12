import { Check } from "lucide-react";
import { PASSWORD_RULES } from "./password-policy";

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm" aria-label="Requisitos da senha">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.id} className={`flex items-center gap-1.5 ${ok ? "text-emerald-700" : "text-muted"}`}>
            <Check className={`h-3.5 w-3.5 ${ok ? "opacity-100" : "opacity-30"}`} aria-hidden />
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
