"use client";

import { CircleAlert } from "lucide-react";
import { useId, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { fieldId, useFieldError } from "./form-errors";
import { arrowTarget } from "./keyboard";

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-3 text-base text-navy-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4";

/** Cores da borda e do anel de foco: normal ou com erro (classes separadas para não brigarem entre si). */
const inputTone = (invalid: boolean) =>
  invalid ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 focus:border-brand-500 focus:ring-brand-100";

function Label({ children, id }: { children: ReactNode; id?: string }) {
  return <span id={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</span>;
}

function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-rose-600"> *</span>
      <span className="sr-only"> (obrigatório)</span>
    </>
  );
}

/** Ids, rótulo e mensagem de um campo: liga `aria-invalid` e `aria-describedby` ao erro ou à dica. */
function useFieldA11y(name: string | undefined, hint: ReactNode | undefined) {
  const autoId = useId();
  const id = name ? fieldId(name) : autoId;
  const { error, touch } = useFieldError(name);
  const messageId = `${id}-mensagem`;
  const message = error ? (
    <p id={messageId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-rose-600">
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      {error}
    </p>
  ) : hint ? (
    <p id={messageId} className="mt-1.5 text-sm text-slate-500">{hint}</p>
  ) : null;

  return {
    id,
    message,
    touch,
    invalid: Boolean(error),
    inputA11y: {
      "aria-invalid": error ? (true as const) : undefined,
      "aria-describedby": message ? messageId : undefined,
    },
  };
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Caminho do campo no registro (ex.: "identification.cpf"): liga o erro e o foco da validação. */
  name?: string;
  type?: string;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  autoCapitalize?: "off" | "none" | "sentences" | "words" | "characters";
  enterKeyHint?: HTMLAttributes<HTMLInputElement>["enterKeyHint"];
  maxLength?: number;
  min?: string;
  max?: string;
  required?: boolean;
  /** Texto de apoio abaixo do campo (some quando há erro). */
  hint?: ReactNode;
  /** Máscara aplicada a cada tecla (ex.: CPF, telefone). */
  format?: (value: string) => string;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  name,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
  autoCapitalize,
  enterKeyHint = "next",
  maxLength,
  min,
  max,
  required,
  hint,
  format,
  className,
}: TextFieldProps) {
  const { id, message, touch, invalid, inputA11y } = useFieldA11y(name, hint);

  return (
    <div className={className}>
      <label htmlFor={id}>
        <Label>
          {label}
          {required && <RequiredMark />}
        </Label>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCapitalize === "characters" || inputMode === "numeric" || inputMode === "tel" ? "off" : undefined}
        spellCheck={inputMode === "numeric" || inputMode === "tel" ? false : undefined}
        enterKeyHint={enterKeyHint}
        maxLength={maxLength}
        min={min}
        max={max}
        required={required}
        aria-required={required || undefined}
        {...inputA11y}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(format ? format(e.target.value) : e.target.value)}
        onBlur={touch}
        className={`${inputBase} ${inputTone(invalid)}`}
      />
      {message}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  hint?: ReactNode;
}

export function TextAreaField({ label, value, onChange, name, rows = 3, placeholder, maxLength, required, hint }: TextAreaFieldProps) {
  const { id, message, touch, invalid, inputA11y } = useFieldA11y(name, hint);
  // Contador só perto do limite, para não poluir a tela.
  const showCounter = maxLength !== undefined && value.length >= maxLength * 0.8;

  return (
    <div>
      <label htmlFor={id}>
        <Label>
          {label}
          {required && <RequiredMark />}
        </Label>
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        maxLength={maxLength}
        required={required}
        aria-required={required || undefined}
        {...inputA11y}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={touch}
        autoCapitalize="sentences"
        className={`${inputBase} resize-y ${inputTone(invalid)}`}
      />
      {message}
      {showCounter && (
        <p className={`mt-1 text-right text-xs tabular-nums ${value.length >= maxLength ? "text-rose-600" : "text-slate-500"}`} aria-live="polite">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

interface Option<T extends string> {
  value: T;
  label: string;
}

/**
 * Uma opção entre poucas (Sim/Não, Normal/Excessivo), como grupo de rádio:
 * Tab entra na opção marcada (ou na primeira), setas trocam a escolha, Espaço/Enter marca ou desmarca.
 * Tocar na opção já marcada desmarca (a resposta pode ficar em branco).
 */
export function ChoiceField<T extends string>({ label, options, value, onChange }: { label: string; options: Option<T>[]; value: T | ""; onChange: (value: T | "") => void }) {
  const labelId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const target = arrowTarget(e.key, index, options.length);
    if (target === null) return;
    e.preventDefault();
    onChange(options[target].value);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[target]?.focus();
  };

  return (
    <div>
      <Label id={labelId}>{label}</Label>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const selected = option.value === value;
          const tabbable = selectedIndex === -1 ? index === 0 : selected;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabbable ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, index)}
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
  const labelId = useId();
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <div>
      <Label id={labelId}>{label}</Label>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option)}
              className={`min-h-11 rounded-full border px-3.5 text-sm font-medium transition active:scale-95 ${
                selected ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {selected && <span aria-hidden="true">✓ </span>}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
