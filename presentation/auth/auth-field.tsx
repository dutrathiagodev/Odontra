"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

interface AuthFieldProps {
  label: string;
  type?: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
}

export function AuthField({ label, type = "text", value, onChange, autoComplete, hint }: AuthFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-white/85">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          required
          className="h-12 w-full rounded-lg border border-transparent bg-[#e8eef7] px-3.5 pr-11 text-base text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/40"
        />
        {isPassword && (
          <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Esconder senha" : "Mostrar senha"} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-md text-slate-500 hover:text-ink">
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-sm text-white/55">{hint}</p>}
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-3.5 py-3 text-sm leading-relaxed ${tone === "error" ? "border-rose-300/40 bg-rose-500/15 text-rose-100" : "border-emerald-300/40 bg-emerald-500/15 text-emerald-50"}`}>
      {children}
    </p>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={busy} className="h-12 w-full rounded-lg bg-white text-base font-semibold text-ink transition-colors hover:bg-[#dfe7f3] disabled:opacity-60">
      {busy ? "Aguarde…" : children}
    </button>
  );
}
