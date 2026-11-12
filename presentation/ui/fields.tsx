"use client";

import type { ReactNode } from "react";

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-navy-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</span>;
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  className?: string;
}

export function TextField({ label, value, onChange, type = "text", placeholder, inputMode, className }: TextFieldProps) {
  return (
    <label className={`block ${className ?? ""}`}>
      <Label>{label}</Label>
      <input type={type} inputMode={inputMode} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputBase} />
    </label>
  );
}

export function TextAreaField({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputBase} resize-y`} />
    </label>
  );
}

interface Option<T extends string> {
  value: T;
  label: string;
}

export function ChoiceField<T extends string>({ label, options, value, onChange }: { label: string; options: Option<T>[]; value: T | ""; onChange: (value: T | "") => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? "" : option.value)}
              className={`min-h-11 rounded-xl border px-4 text-sm font-semibold transition active:scale-95 ${
                selected ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25" : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const YES_NO: Option<"yes" | "no">[] = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
];

export function YesNoField({ label, value, onChange }: { label: string; value: "yes" | "no" | ""; onChange: (value: "yes" | "no" | "") => void }) {
  return <ChoiceField label={label} options={YES_NO} value={value} onChange={onChange} />;
}

export function CheckboxGroup({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string[]; onChange: (value: string[]) => void }) {
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option)}
              className={`min-h-10 rounded-full border px-3.5 text-sm font-medium transition active:scale-95 ${
                selected ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {selected ? "✓ " : ""}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
