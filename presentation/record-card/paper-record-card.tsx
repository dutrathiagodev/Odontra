"use client";

import type { ReactNode } from "react";
import { LOWER_TEETH, TOOTH_CONDITION_LABELS, UPPER_TEETH, type Odontogram, type ToothCondition } from "@/domain/tooth";
import { CONDITION_COLORS } from "../odontogram/condition-style";
import { TOOTH_PROFILE, toothKind } from "../odontogram/tooth-shapes";
import { handFont } from "./hand-font";

/** Tinta vermelha das fichas odontológicas de papel. */
const INK = "#d0365f";
const RULE = "#b8c2d6";

export interface PaperRecordData {
  number: string;
  name: string;
  address: string;
  homePhone: string;
  workAddress: string;
  workPhone: string;
  occupation: string;
  birthDate: string;
  nationality: string;
  maritalStatus: string;
  referral: string;
  startDate: string;
  notes: string;
  odontogram: Odontogram;
}

interface PaperRecordCardProps {
  data: PaperRecordData;
  /** Toque no dente (no painel abre a edição; na landing só demonstra). */
  onToothClick?: (fdi: string) => void;
  className?: string;
}

/**
 * A ficha clínica de papel que todo dentista conhece, agora na tela:
 * linhas de identificação, odontograma em vermelho (perfil + oclusal), arco com radiografias e anotações.
 * Dentes com alguma condição aparecem pintados com a cor da legenda do Odontra.
 */
export function PaperRecordCard({ data, onToothClick, className = "" }: PaperRecordCardProps) {
  const marked = [...UPPER_TEETH, ...LOWER_TEETH].filter((t) => data.odontogram[t] && data.odontogram[t].condition !== "healthy");

  return (
    <article
      aria-label={`Ficha clínica ${data.name ? `de ${data.name}` : ""}`}
      className={`rounded-md bg-[#fbfbfe] p-3 text-[#5a6478] shadow-[0_1px_0_#e6e9f2,0_18px_40px_-18px_rgba(14,34,64,0.35)] ring-1 ring-[#dfe3ee] sm:p-5 ${className}`}
    >
      <div className="border border-[#c9d0de] text-[11px] sm:text-[12px]">
        <Line cells={[{ label: "Nome", value: data.name, grow: 6 }, { label: "Nº", value: data.number, grow: 1 }]} />
        <Line cells={[{ label: "Residência", value: data.address, grow: 6 }, { label: "Tel.", value: data.homePhone, grow: 2 }]} />
        <Line cells={[{ label: "End. Com.", value: data.workAddress, grow: 6 }, { label: "Tel.", value: data.workPhone, grow: 2 }]} />
        <Line
          cells={[
            { label: "Profissão", value: data.occupation, grow: 3 },
            { label: "Nasc.", value: data.birthDate, grow: 2 },
            { label: "Nac.", value: data.nationality, grow: 2 },
            { label: "E. Civil", value: data.maritalStatus, grow: 2 },
          ]}
        />
        <Line cells={[{ label: "Indicado por", value: data.referral, grow: 1 }]} />
        <Line cells={[{ label: "Início tratamento", value: data.startDate, grow: 2 }, { label: "Término", value: "", grow: 1 }, { label: "Interrupção", value: "", grow: 1 }]} />

        <div className="grid border-t border-[#c9d0de] md:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto px-1 py-2">
            <TeethChart odontogram={data.odontogram} onToothClick={onToothClick} />
          </div>
          <div className="border-t border-[#c9d0de] md:border-l md:border-t-0">
            <ArchWithRadiographs />
          </div>
        </div>

        <div className="grid border-t border-[#c9d0de] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="border-b border-[#c9d0de] p-2 sm:border-b-0 sm:border-r">
            <p className="text-center text-[11px] font-bold tracking-wide" style={{ color: "#3c4a66" }}>DENTES</p>
            <p className="mt-1">Cor ______ Esc. ______</p>
            <p className="mt-1">Forma ____________</p>
          </div>
          <div className="min-h-16 p-2">
            <span>Anotações</span>
            <p className={`mt-1 whitespace-pre-line text-[17px] leading-tight text-[#1f3a8a] ${handFont.className}`}>
              {[
                ...marked.map((t) => `${t}: ${TOOTH_CONDITION_LABELS[data.odontogram[t].condition]}${data.odontogram[t].note ? ` — ${data.odontogram[t].note}` : ""}`),
                data.notes,
              ]
                .filter(Boolean)
                .join("\n")}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function Line({ cells }: { cells: { label: string; value: string; grow: number }[] }) {
  return (
    <div className="flex border-b border-[#d7dce8] last:border-b-0">
      {cells.map((cell, i) => (
        <Cell key={i} label={cell.label} grow={cell.grow} divider={i > 0}>
          {cell.value}
        </Cell>
      ))}
    </div>
  );
}

function Cell({ label, grow, divider, children }: { label: string; grow: number; divider: boolean; children: ReactNode }) {
  return (
    <div className={`flex min-w-0 items-baseline gap-1.5 px-2 py-1 ${divider ? "border-l border-[#d7dce8]" : ""}`} style={{ flexGrow: grow, flexBasis: 0 }}>
      <span className="shrink-0">{label}</span>
      <span className={`truncate text-[17px] leading-none text-[#1f3a8a] ${handFont.className}`}>{children}</span>
    </div>
  );
}

// ---------- odontograma em tinta vermelha ----------

const STEP = 24;

function fillFor(condition: ToothCondition | undefined): string {
  if (!condition || condition === "healthy" || condition === "missing") return "transparent";
  return CONDITION_COLORS[condition];
}

function TeethChart({ odontogram, onToothClick }: { odontogram: Odontogram; onToothClick?: (fdi: string) => void }) {
  const x = (i: number) => 6 + i * STEP;
  const condition = (fdi: string) => odontogram[fdi]?.condition;
  const clickable = Boolean(onToothClick);

  const tooth = (fdi: string, child: ReactNode) => (
    <g
      key={fdi}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Dente ${fdi}${condition(fdi) ? `: ${TOOTH_CONDITION_LABELS[condition(fdi)!]}` : ""}` : undefined}
      onClick={clickable ? () => onToothClick?.(fdi) : undefined}
      onKeyDown={clickable ? (e) => (e.key === "Enter" || e.key === " ") && onToothClick?.(fdi) : undefined}
      className={clickable ? "cursor-pointer outline-none [&:focus-visible>*]:stroke-[2.2]" : undefined}
    >
      {child}
    </g>
  );

  return (
    <svg viewBox="0 0 396 200" className="mx-auto block w-full min-w-[340px] max-w-[560px]" role="img" aria-label="Odontograma da ficha">
      {/* Superiores em perfil (raiz para cima) */}
      {UPPER_TEETH.map((t, i) =>
        tooth(t, <ProfileTooth fdi={t} condition={condition(t)} x={x(i)} y={4} flipped />),
      )}
      {/* Superiores oclusal */}
      {UPPER_TEETH.map((t, i) => tooth(`${t}-o`, <OcclusalTooth fdi={t} condition={condition(t)} cx={x(i) + 12} cy={64} />))}
      {/* Inferiores oclusal */}
      {LOWER_TEETH.map((t, i) => tooth(`${t}-o`, <OcclusalTooth fdi={t} condition={condition(t)} cx={x(i) + 12} cy={88} />))}
      {/* Inferiores em perfil */}
      {LOWER_TEETH.map((t, i) => tooth(t, <ProfileTooth fdi={t} condition={condition(t)} x={x(i)} y={106} flipped={false} />))}
      {/* Numeração FDI discreta embaixo */}
      {LOWER_TEETH.map((t, i) => (
        <text key={`n${t}`} x={x(i) + 12} y={196} textAnchor="middle" fontSize="7" fill={INK} opacity="0.7">{t}</text>
      ))}
    </svg>
  );
}

function ProfileTooth({ fdi, condition, x, y, flipped }: { fdi: string; condition?: ToothCondition; x: number; y: number; flipped: boolean }) {
  const transform = flipped ? `translate(${x} ${y + 52}) scale(1 -1.18)` : `translate(${x} ${y}) scale(1 1.18)`;
  return (
    <g transform={transform}>
      <path
        d={TOOTH_PROFILE[toothKind(fdi)]}
        fill={fillFor(condition)}
        fillOpacity={0.55}
        stroke={INK}
        strokeWidth={1}
        strokeDasharray={condition === "missing" ? "2.5 2" : undefined}
        strokeLinejoin="round"
      />
      {condition === "extraction" && <path d="M5 6 L19 38 M19 6 L5 38" stroke={INK} strokeWidth={1.6} />}
    </g>
  );
}

function OcclusalTooth({ fdi, condition, cx, cy }: { fdi: string; condition?: ToothCondition; cx: number; cy: number }) {
  const kind = toothKind(fdi);
  const w = kind === "molar" ? 9 : kind === "premolar" ? 7.6 : 6.4;
  const h = kind === "molar" ? 8.6 : 7.4;
  return (
    <g>
      <rect x={cx - w} y={cy - h} width={w * 2} height={h * 2} rx={kind === "molar" ? 4 : 6} fill={fillFor(condition)} fillOpacity={0.55} stroke={INK} strokeWidth={1} />
      {kind === "molar" || kind === "premolar" ? (
        <path d={`M${cx - w + 3} ${cy} H${cx + w - 3} M${cx} ${cy - h + 3} V${cy + h - 3}`} stroke={INK} strokeWidth={0.7} />
      ) : (
        <path d={`M${cx - w + 2.5} ${cy} H${cx + w - 2.5}`} stroke={INK} strokeWidth={0.7} />
      )}
    </g>
  );
}

const DIGITS = ["8", "7", "6", "5", "4", "3", "2", "1", "1", "2", "3", "4", "5", "6", "7", "8"];

/** Arco dentário com a cruz dos quadrantes e a grade de radiografias. */
function ArchWithRadiographs() {
  const cx = 100;
  const cy = 66;
  // Arredonda para o HTML do servidor e do navegador baterem (evita erro de hidratação).
  const round = (n: number) => Math.round(n * 100) / 100;
  const point = (angle: number, rx: number, ry: number) => ({ x: round(cx + rx * Math.cos(angle)), y: round(cy + ry * Math.sin(angle)) });
  const upper = Array.from({ length: 16 }, (_, i) => point(Math.PI + ((i + 0.5) / 16) * Math.PI, 52, 50));
  const lower = Array.from({ length: 16 }, (_, i) => point(Math.PI - ((i + 0.5) / 16) * Math.PI, 52, 50));

  return (
    <svg viewBox="0 0 200 190" className="mx-auto block w-full max-w-[260px]" role="img" aria-label="Arco dentário e radiografias">
      <ellipse cx={cx} cy={cy} rx={60} ry={58} fill="none" stroke={INK} strokeWidth={1} />
      <ellipse cx={cx} cy={cy} rx={44} ry={42} fill="none" stroke={INK} strokeWidth={0.8} />
      {[...upper, ...lower].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4.6} fill="#fbfbfe" stroke={INK} strokeWidth={0.9} />
      ))}
      <path d={`M${cx} ${cy - 40} L${cx + 3} ${cy - 3} L${cx + 40} ${cy} L${cx + 3} ${cy + 3} L${cx} ${cy + 40} L${cx - 3} ${cy + 3} L${cx - 40} ${cy} L${cx - 3} ${cy - 3} Z`} fill={INK} opacity="0.9" />
      <text x={cx} y={144} textAnchor="middle" fontSize="9" fontWeight="700" fill="#3c4a66" letterSpacing="1">RADIOGRAFIAS</text>
      {[0, 1].map((r) =>
        DIGITS.map((d, i) => (
          <g key={`${r}-${i}`}>
            <rect x={4 + i * 12} y={150 + r * 17} width={11.4} height={15} fill="none" stroke={RULE} strokeWidth={0.7} />
            <text x={4 + i * 12 + 5.7} y={150 + r * 17 + 10.5} textAnchor="middle" fontSize="7" fill="#7a849a">{d}</text>
          </g>
        )),
      )}
    </svg>
  );
}
