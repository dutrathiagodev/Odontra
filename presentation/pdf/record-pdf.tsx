/* eslint-disable jsx-a11y/alt-text -- <Image> do react-pdf não é um <img> HTML */
import { Circle, Document, G, Image, Line, Page, Path, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { DISEASE_CATEGORIES, type Patient } from "@/domain/patient/patient";
import { LOWER_TEETH, TOOTH_CONDITION_LABELS, UPPER_TEETH, type ToothCondition } from "@/domain/tooth";
import type { Visit } from "@/domain/visit/visit";
import { formatDate, formatLongDate, formatRecordNumber } from "../format";
import { CONDITION_COLORS } from "../odontogram/condition-style";
import { TOOTH_PROFILE, toothKind } from "../odontogram/tooth-shapes";

/*
 * Prontuário em A4 seguindo a ficha odontológica impressa de referência:
 * faixas de seção, linhas arredondadas com rótulo e valor na mesma linha,
 * marcações em bolinha/quadrado e odontograma em perfil + vista oclusal.
 * Os valores preenchidos saem em azul, como caneta sobre o formulário.
 */

const ACCENT = "#0e2240";
const LINE = "#b8c1ce";
const TINT = "#eef2f7";
const LABEL = "#2b3445";
const PEN = "#1f3fae";

const s = StyleSheet.create({
  page: { paddingTop: 24, paddingHorizontal: 26, paddingBottom: 44, fontFamily: "Helvetica", fontSize: 7, color: LABEL },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  brand: { flexDirection: "row", alignItems: "center" },
  seal: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: ACCENT, alignItems: "center", justifyContent: "center", marginRight: 8 },
  dentist: { fontFamily: "Helvetica-Bold", fontSize: 14, color: ACCENT },
  dentistSub: { fontSize: 7.5, color: "#5b6b84", marginTop: 1.5 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 13, color: ACCENT, textAlign: "right" },
  numberBox: { marginTop: 4, width: 170, height: 18, borderWidth: 0.8, borderColor: LINE, borderRadius: 3, flexDirection: "row", alignItems: "center", paddingHorizontal: 6, alignSelf: "flex-end" },
  photo: { width: 46, height: 46, borderRadius: 4, objectFit: "cover", marginLeft: 8 },
  bar: { backgroundColor: ACCENT, borderRadius: 3, height: 14, justifyContent: "center", paddingHorizontal: 8, marginTop: 7, marginBottom: 3 },
  barText: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 9 },
  row: { flexDirection: "row", alignItems: "center", borderWidth: 0.7, borderColor: LINE, borderRadius: 3, minHeight: 15, paddingHorizontal: 6, paddingVertical: 2.5, marginBottom: 2.6 },
  field: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 6.3, textTransform: "uppercase", color: LABEL },
  value: { fontSize: 8, color: PEN, marginLeft: 3 },
  mark: { width: 7, height: 7, borderWidth: 0.7, borderColor: "#4b5567", alignItems: "center", justifyContent: "center", marginLeft: 5, marginRight: 2.5 },
  dot: { width: 3.6, height: 3.6, backgroundColor: PEN },
  sign: { marginTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  signLine: { width: 210, borderTopWidth: 0.7, borderTopColor: "#334155", paddingTop: 3, textAlign: "center", fontSize: 6.3, textTransform: "uppercase" },
  footer: { position: "absolute", bottom: 14, left: 26, right: 26, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 6.3, color: "#7a889e" },
});

// ---------- peças da ficha ----------

function Bar({ title }: { title: string }) {
  return (
    <View style={s.bar} wrap={false}>
      <Text style={s.barText}>{title}</Text>
    </View>
  );
}

function Row({ children, tinted = false }: { children: ReactNode; tinted?: boolean }) {
  return (
    <View style={[s.row, tinted ? { backgroundColor: TINT } : {}]} wrap={false}>
      {children}
    </View>
  );
}

function Field({ label, value, flex = 1, children }: { label: string; value?: string; flex?: number; children?: ReactNode }) {
  return (
    <View style={[s.field, { flex }]}>
      <Text style={s.label}>{label}:</Text>
      {children}
      {value ? <Text style={s.value}>{value}</Text> : null}
    </View>
  );
}

/** Bolinha (escolha única) ou quadradinho (múltipla escolha). */
function Mark({ checked, label, square = false }: { checked: boolean; label: string; square?: boolean }) {
  return (
    <View style={s.field}>
      <View style={[s.mark, { borderRadius: square ? 1 : 3.5 }]}>{checked ? <View style={[s.dot, { borderRadius: square ? 0.5 : 1.8 }]} /> : null}</View>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

function YesNo({ value }: { value: string }) {
  return (
    <>
      <Mark checked={value === "yes"} label="Sim" />
      <Mark checked={value === "no"} label="Não" />
    </>
  );
}

function Options({ value, items }: { value: string; items: [string, string][] }) {
  return (
    <>
      {items.map(([key, label]) => (
        <Mark key={key} checked={value === key} label={label} />
      ))}
    </>
  );
}

/** Quebra o texto nas linhas pautadas da ficha (a primeira divide espaço com o rótulo). */
function wrapLines(text: string, firstMax: number, max: number, count: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const limit = lines.length === 0 ? firstMax : max;
    if ((current + " " + word).trim().length > limit) {
      lines.push(current.trim());
      current = word;
    } else current = `${current} ${word}`;
  }
  if (current.trim()) lines.push(current.trim());
  while (lines.length < count) lines.push("");
  return lines;
}

function Ruled({ label, text, lines }: { label?: string; text: string; lines: number }) {
  const content = wrapLines(text, label ? 92 : 128, 128, lines);
  return (
    <View>
      {content.map((line, i) => (
        <Row key={i}>
          {i === 0 && label ? <Text style={s.label}>{label}:</Text> : null}
          <Text style={[s.value, i === 0 && label ? {} : { marginLeft: 0 }]}>{line}</Text>
        </Row>
      ))}
    </View>
  );
}

// ---------- odontograma ----------

const STEP = 22;

function toothFill(condition: ToothCondition): string {
  return condition === "healthy" || condition === "missing" ? "#ffffff" : CONDITION_COLORS[condition];
}

function ProfileTooth({ fdi, condition, x, y, flipped }: { fdi: string; condition: ToothCondition; x: number; y: number; flipped: boolean }) {
  const transform = flipped ? `translate(${x}, ${y + 44}) scale(1, -1)` : `translate(${x}, ${y})`;
  const missing = condition === "missing";
  return (
    <G transform={transform}>
      <Path d={TOOTH_PROFILE[toothKind(fdi)]} fill={toothFill(condition)} stroke="#4b5567" strokeWidth={0.7} strokeDasharray={missing ? "2 1.5" : undefined} />
      {condition === "extraction" ? <Path d="M5 6 L19 38 M19 6 L5 38" stroke="#be123c" strokeWidth={1.4} /> : null}
    </G>
  );
}

function OcclusalTooth({ condition, cx, cy }: { condition: ToothCondition; cx: number; cy: number }) {
  const d = 1.9;
  const D = 4.7;
  return (
    <G>
      <Circle cx={cx} cy={cy} r={6.4} fill={toothFill(condition)} stroke="#4b5567" strokeWidth={0.6} />
      <Circle cx={cx} cy={cy} r={2.6} fill="#ffffff" stroke="#4b5567" strokeWidth={0.5} />
      <Line x1={cx - d} y1={cy - d} x2={cx - D} y2={cy - D} stroke="#4b5567" strokeWidth={0.5} />
      <Line x1={cx + d} y1={cy - d} x2={cx + D} y2={cy - D} stroke="#4b5567" strokeWidth={0.5} />
      <Line x1={cx - d} y1={cy + d} x2={cx - D} y2={cy + D} stroke="#4b5567" strokeWidth={0.5} />
      <Line x1={cx + d} y1={cy + d} x2={cx + D} y2={cy + D} stroke="#4b5567" strokeWidth={0.5} />
    </G>
  );
}

function TeethChart({ odontogram }: { odontogram: Visit["odontogram"] }) {
  const condition = (fdi: string): ToothCondition => odontogram[fdi]?.condition ?? "healthy";
  const x = (i: number) => 4 + i * STEP;
  return (
    <Svg width={360} height={160} viewBox="0 0 360 160">
      {UPPER_TEETH.map((t, i) => <ProfileTooth key={t} fdi={t} condition={condition(t)} x={x(i)} y={2} flipped />)}
      {UPPER_TEETH.map((t, i) => <OcclusalTooth key={t} condition={condition(t)} cx={x(i) + 12} cy={56} />)}
      {UPPER_TEETH.map((t, i) => <Text key={t} x={x(i) + 12} y={73} textAnchor="middle" style={{ fontSize: 6.5 }}>{t}</Text>)}
      {LOWER_TEETH.map((t, i) => <Text key={t} x={x(i) + 12} y={84} textAnchor="middle" style={{ fontSize: 6.5 }}>{t}</Text>)}
      {LOWER_TEETH.map((t, i) => <OcclusalTooth key={t} condition={condition(t)} cx={x(i) + 12} cy={96} />)}
      {LOWER_TEETH.map((t, i) => <ProfileTooth key={t} fdi={t} condition={condition(t)} x={x(i)} y={110} flipped={false} />)}
    </Svg>
  );
}

const RADIOGRAPH_DIGITS = ["8", "7", "6", "5", "4", "3", "2", "1", "1", "2", "3", "4", "5", "6", "7", "8"];

/** Arco dentário e grade de radiografias, como no canto da ficha impressa. */
function ArchAndRadiographs() {
  const cx = 85;
  const cy = 62;
  const point = (angle: number) => ({ x: cx + 44 * Math.cos(angle), y: cy + 46 * Math.sin(angle) });
  const upper = Array.from({ length: 16 }, (_, i) => point(Math.PI + ((i + 0.5) / 16) * Math.PI));
  const lower = Array.from({ length: 16 }, (_, i) => point(Math.PI - ((i + 0.5) / 16) * Math.PI));
  return (
    <Svg width={170} height={160} viewBox="0 0 170 160">
      <Line x1={cx} y1={10} x2={cx} y2={114} stroke="#4b5567" strokeWidth={0.6} />
      <Line x1={30} y1={cy} x2={140} y2={cy} stroke="#4b5567" strokeWidth={0.6} />
      {[...upper, ...lower].map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3.3} fill="#ffffff" stroke="#4b5567" strokeWidth={0.6} />)}
      <Text x={cx} y={128} textAnchor="middle" style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>RADIOGRAFIAS</Text>
      {[0, 1].map((r) =>
        RADIOGRAPH_DIGITS.map((digit, i) => (
          <G key={`${r}-${i}`}>
            <Rect x={6 + i * 9.9} y={134 + r * 11} width={9.2} height={10} fill="#ffffff" stroke="#4b5567" strokeWidth={0.5} />
            <Text x={6 + i * 9.9 + 4.6} y={134 + r * 11 + 7} textAnchor="middle" style={{ fontSize: 5 }}>{digit}</Text>
          </G>
        )),
      )}
    </Svg>
  );
}

// ---------- documento ----------

interface RecordPdfProps {
  patient: Patient;
  visit: Visit;
  logoSrc?: string;
  qrDataUrl?: string;
  siteUrl?: string;
}

export function RecordPdf({ patient, visit, logoSrc, qrDataUrl, siteUrl }: RecordPdfProps) {
  const id = patient.identification;
  const a = patient.anamnesis;
  const oh = visit.oralHealth;
  const ex = visit.clinicalExam;
  const number = formatRecordNumber(patient.number);

  const toothNotes = [...UPPER_TEETH, ...LOWER_TEETH]
    .filter((t) => visit.odontogram[t])
    .map((t) => `Dente ${t}: ${TOOTH_CONDITION_LABELS[visit.odontogram[t].condition]}${visit.odontogram[t].note ? `, ${visit.odontogram[t].note}` : ""}.`);
  const changes = [visit.reason ? `Motivo: ${visit.reason}.` : "", ...toothNotes, visit.findings].filter(Boolean).join(" ");

  const footer = (
    <View style={s.footer} fixed>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Prontuário Nº ${number}, consulta ${visit.sequence}, página ${pageNumber} de ${totalPages}`} />
      {qrDataUrl ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[s.footerText, { marginRight: 5 }]}>{siteUrl}</Text>
          <Image src={qrDataUrl} style={{ width: 24, height: 24 }} />
        </View>
      ) : null}
    </View>
  );

  return (
    <Document title={`Prontuário ${number} - ${id.name}`} author={visit.dentist.name || "Odontra"}>
      {/* Página 1: identificação e anamnese */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.brand}>
            <View style={s.seal}>{logoSrc ? <Image src={logoSrc} style={{ width: 24, height: 24 }} /> : null}</View>
            <View>
              <Text style={s.dentist}>{visit.dentist.name || "Cirurgião-dentista"}</Text>
              <Text style={s.dentistSub}>Cirurgião-dentista{visit.dentist.cro ? `, CRO ${visit.dentist.cro}` : ""}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View>
              <Text style={s.title}>PRONTUÁRIO ODONTOLÓGICO</Text>
              <View style={s.numberBox}>
                <Text style={[s.label, { fontSize: 8, fontFamily: "Helvetica-Bold" }]}>Nº:</Text>
                <Text style={s.value}>{number}</Text>
              </View>
            </View>
            {patient.photo ? <Image src={patient.photo} style={s.photo} /> : null}
          </View>
        </View>

        <Bar title="Identificação do Paciente" />
        <Row tinted><Field label="Nome" value={id.name} /></Row>
        <Row tinted>
          <Field label="RG" value={id.rg} />
          <Field label="Órgão expedidor" value={id.issuingBody} />
          <Field label="CPF" value={id.cpf} />
        </Row>
        <Row tinted>
          <Field label="Naturalidade" value={id.birthplace} />
          <Field label="Nacionalidade" value={id.nationality} />
          <Field label="Estado civil" value={id.maritalStatus} />
        </Row>
        <Row tinted>
          <Field label="Data de nascimento" value={formatDate(id.birthDate)} />
          <Field label="Sexo">
            <Mark square checked={id.sex === "M"} label="M" />
            <Mark square checked={id.sex === "F"} label="F" />
          </Field>
          <Field label="Profissão" value={id.occupation} />
        </Row>
        <Row tinted><Field label="Endereço residencial" value={id.homeAddress} flex={2} /><Field label="Telefone" value={id.homePhone} /></Row>
        <Row tinted><Field label="Endereço profissional" value={id.workAddress} flex={2} /><Field label="Telefone" value={id.workPhone} /></Row>
        <Row tinted>
          <Field label="Indicação" value={id.referral} />
          <Field label="Convênio" value={id.insurance} />
          <Field label="Nº de inscrição" value={id.insuranceNumber} />
        </Row>
        <Row tinted><Field label="Contato para emergência" value={id.emergencyContact} flex={2} /><Field label="Telefone" value={id.emergencyPhone} /></Row>

        <Bar title="Anamnese" />
        <Ruled label="Queixa principal e história da doença atual" text={a.chiefComplaint} lines={4} />
        <Row>
          <Field label="Uso de medicação" flex={2}><YesNo value={a.usesMedication} /><Text style={[s.label, { marginLeft: 4 }]}>Qual:</Text><Text style={s.value}>{a.medication}</Text></Field>
          <Field label="Pressão arterial" value={a.bloodPressure} />
        </Row>
        <Row><Field label="Alergia"><YesNo value={a.allergy} /><Text style={[s.label, { marginLeft: 4 }]}>Qual:</Text><Text style={s.value}>{a.allergyDetail}</Text></Field></Row>
        <Row><Field label="Doença"><YesNo value={a.hasDisease} /></Field></Row>
        {[0, 5, 10].map((start) => (
          <Row key={start}>
            {DISEASE_CATEGORIES.slice(start, start + 5).map((d) => (
              <View key={d} style={{ flex: 1 }}>
                <Mark square checked={a.diseaseCategories.includes(d)} label={d} />
              </View>
            ))}
            {start === 10 ? <View style={{ flex: 1 }} /> : null}
          </Row>
        ))}
        <Row><Field label="Especificar" value={a.diseaseDetail} /></Row>
        <Row><Field label="Passou por alguma cirurgia"><YesNo value={a.hadSurgery} /><Text style={[s.label, { marginLeft: 4 }]}>Qual:</Text><Text style={s.value}>{a.surgeryDetail}</Text></Field></Row>
        <Row>
          <Field label="Quando se fere seu sangramento é" flex={1.4}><Options value={a.bleeding} items={[["normal", "Normal"], ["excessive", "Excessivo"]]} /></Field>
          <Field label="Cicatrização"><Options value={a.healing} items={[["normal", "Normal"], ["complicated", "Complicada"]]} /></Field>
        </Row>
        <Row>
          <Field label="Sente falta de ar" flex={1.4}><YesNo value={a.shortnessOfBreath} /><Text style={[s.label, { marginLeft: 4 }]}>Frequência:</Text><Text style={s.value}>{a.shortnessFrequency}</Text></Field>
          <Field label="Gestante"><YesNo value={a.pregnant} /><Text style={[s.label, { marginLeft: 4 }]}>Semanas:</Text><Text style={s.value}>{a.pregnancyWeeks}</Text></Field>
        </Row>
        <Ruled label="Observações" text={a.notes} lines={4} />
        {footer}
      </Page>

      {/* Página 2: saúde bucal, exame clínico, odontograma e alterações */}
      <Page size="A4" style={s.page}>
        <Bar title="Saúde Bucal" />
        <Row>
          <Field label="Teve reação com anestesia dental"><YesNo value={oh.anesthesiaReaction} /></Field>
          <Field label="Sente dor nos dentes ou gengiva"><YesNo value={oh.toothOrGumPain} /></Field>
        </Row>
        <Row>
          <Field label="Sangramento na gengiva"><YesNo value={oh.gumBleeding} /><Text style={[s.label, { marginLeft: 4 }]}>Quando:</Text><Text style={s.value}>{oh.gumBleedingWhen}</Text></Field>
          <Field label="Sente gosto ruim ou boca seca"><YesNo value={oh.badTaste} /></Field>
        </Row>
        <Row>
          <Field label="Costuma ranger os dentes"><YesNo value={oh.bruxism} /></Field>
          <Field label="Dor no maxilar ou ouvido"><YesNo value={oh.jawOrEarPain} /></Field>
        </Row>
        <Row>
          <Field label="Último tratamento dentário" value={oh.lastTreatment} />
          <Field label="Fumante"><YesNo value={oh.smoker} /></Field>
        </Row>
        <Row>
          <Field label="Escova os dentes quantas vezes ao dia" value={oh.brushingPerDay} />
          <Field label="Utiliza fio dental"><YesNo value={oh.flosses} /></Field>
        </Row>

        <Bar title="Antecedentes Familiares" />
        <Ruled text={a.familyHistory} lines={2} />

        <Bar title="Exame Clínico" />
        <Row>
          <Field label="Higiene" flex={1.6}><Options value={ex.hygiene} items={[["normal", "Normal"], ["regular", "Regular"], ["bad", "Ruim"]]} /></Field>
          <Field label="Língua" value={ex.tongue} />
        </Row>
        <Row>
          <Field label="Halitose" flex={1.6}><Options value={ex.halitosis} items={[["absent", "Ausente"], ["moderate", "Moderada"], ["strong", "Forte"]]} /></Field>
          <Field label="Palato" value={ex.palate} />
        </Row>
        <Row>
          <Field label="Tártaro" flex={1.6}><Options value={ex.tartar} items={[["absent", "Ausente"], ["little", "Pouco"], ["much", "Muito"]]} /></Field>
          <Field label="Assoalho bucal" value={ex.mouthFloor} />
        </Row>
        <Row>
          <Field label="Gengiva" flex={1.6}><Options value={ex.gingiva} items={[["normal", "Normal"], ["gingivitis", "Gengivite"], ["periodontitis", "Periodontite"]]} /></Field>
          <Field label="Lábios" value={ex.lips} />
        </Row>
        <Row><Field label="Mucosa"><Options value={ex.mucosa} items={[["normal", "Normal"], ["altered", "Alterada"]]} /></Field></Row>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }} wrap={false}>
          <TeethChart odontogram={visit.odontogram} />
          <ArchAndRadiographs />
        </View>

        <Bar title="Alterações" />
        <Ruled text={changes} lines={7} />

        <View style={s.sign} wrap={false}>
          <View>
            <Text style={[s.value, { marginLeft: 0, fontSize: 8.5 }]}>{formatLongDate(visit.date)}</Text>
            <Text style={[s.label, { borderTopWidth: 0.7, borderTopColor: "#334155", paddingTop: 2, width: 170 }]}>Data</Text>
          </View>
          <Text style={s.signLine}>Assinatura e carimbo cirurgião-dentista</Text>
        </View>
        {footer}
      </Page>
    </Document>
  );
}
