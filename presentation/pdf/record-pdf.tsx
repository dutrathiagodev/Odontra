/* eslint-disable jsx-a11y/alt-text -- <Image> do react-pdf não é um <img> HTML */
import { Document, G, Image, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { Patient } from "@/domain/patient/patient";
import {
  LOWER_TEETH,
  TOOTH_CONDITIONS,
  TOOTH_CONDITION_LABELS,
  UPPER_TEETH,
  type ToothCondition,
} from "@/domain/tooth";
import type { Visit } from "@/domain/visit/visit";
import { formatDate, formatRecordNumber } from "../format";
import { CONDITION_COLORS, TOOTH_PATH, TOOTH_STROKE } from "../odontogram/condition-style";

const NAVY = "#0b2a5b";
const BRAND = "#2563eb";
const LINE = "#cbd5e1";
const SOFT = "#eff6ff";

const s = StyleSheet.create({
  page: { paddingTop: 28, paddingHorizontal: 28, paddingBottom: 58, fontSize: 8.5, fontFamily: "Helvetica", color: "#0f1d3a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  dentist: { fontFamily: "Helvetica-Bold", fontSize: 14, color: NAVY },
  dentistSub: { fontSize: 8.5, color: "#64748b", marginTop: 2 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 13, color: NAVY, textAlign: "right" },
  numberBox: { marginTop: 4, borderWidth: 0.7, borderColor: LINE, borderRadius: 3, paddingVertical: 3, paddingHorizontal: 8, alignSelf: "flex-end" },
  bar: { backgroundColor: NAVY, borderRadius: 3, paddingVertical: 3.5, paddingHorizontal: 8, marginTop: 8, marginBottom: 4 },
  barText: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 9.5 },
  row: { flexDirection: "row", borderWidth: 0.7, borderColor: LINE, borderRadius: 3, marginBottom: 3 },
  cell: { paddingVertical: 3, paddingHorizontal: 6, flexGrow: 1, flexBasis: 0 },
  label: { fontSize: 6.5, color: "#64748b", textTransform: "uppercase", marginBottom: 1 },
  value: { fontSize: 9 },
  box: { borderWidth: 0.7, borderColor: LINE, borderRadius: 3, padding: 6, minHeight: 34, marginBottom: 3 },
  photo: { width: 62, height: 62, borderRadius: 4, objectFit: "cover" },
  identWrap: { flexDirection: "row", gap: 6 },
  chip: { backgroundColor: SOFT, borderRadius: 8, paddingVertical: 1.5, paddingHorizontal: 6, marginRight: 3, marginBottom: 3, color: BRAND, fontSize: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  toothNote: { flexDirection: "row", marginBottom: 2 },
  footer: { position: "absolute", bottom: 16, left: 28, right: 28, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 0.7, borderTopColor: LINE, paddingTop: 5 },
  footerText: { fontSize: 7, color: "#64748b" },
  signature: { marginTop: 26, alignItems: "flex-end" },
  signatureLine: { width: 200, borderTopWidth: 0.7, borderTopColor: "#334155", paddingTop: 3, textAlign: "center", fontSize: 7.5 },
});

const yesNo = (v: string) => `${v === "yes" ? "[X]" : "[ ]"} Sim   ${v === "no" ? "[X]" : "[ ]"} Não`;
const options = (v: string, items: [string, string][]) => items.map(([key, label]) => `${v === key ? "[X]" : "[ ]"} ${label}`).join("   ");

function Bar({ title }: { title: string }) {
  return (
    <View style={s.bar} wrap={false}>
      <Text style={s.barText}>{title}</Text>
    </View>
  );
}

function Cell({ label, value, flex = 1 }: { label: string; value?: string; flex?: number }) {
  return (
    <View style={[s.cell, { flexGrow: flex }]}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value || " "}</Text>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.row} wrap={false}>
      {children}
    </View>
  );
}

function TextBox({ label, value, minHeight }: { label?: string; value: string; minHeight?: number }) {
  return (
    <View style={[s.box, minHeight ? { minHeight } : {}]}>
      {label && <Text style={s.label}>{label}</Text>}
      <Text style={s.value}>{value || " "}</Text>
    </View>
  );
}

function OdontogramPdf({ odontogram }: { odontogram: Visit["odontogram"] }) {
  const STEP = 31;
  const draw = (teeth: readonly string[], y: number, flipped: boolean) =>
    teeth.map((tooth, i) => {
      const condition: ToothCondition = odontogram[tooth]?.condition ?? "healthy";
      const x = 6 + i * STEP;
      const transform = flipped ? `translate(${x}, ${y + 40}) scale(1, -1)` : `translate(${x}, ${y})`;
      return (
        <G key={tooth}>
          <G transform={transform}>
            <Path d={TOOTH_PATH} fill={CONDITION_COLORS[condition]} stroke={TOOTH_STROKE} strokeWidth={1} />
            {condition === "extraction" && <Path d="M6 5 L18 31 M18 5 L6 31" stroke="#ffffff" strokeWidth={2} />}
            {condition === "endodontics" && <Path d="M12 12 V30" stroke="#ffffff" strokeWidth={2} />}
          </G>
        </G>
      );
    });

  return (
    <Svg width={510} height={128} viewBox="0 0 510 128">
      {draw(UPPER_TEETH, 14, false)}
      {draw(LOWER_TEETH, 74, true)}
      {UPPER_TEETH.map((t, i) => (
        <Text key={t} x={6 + i * STEP + 12} y={9} style={{ fontSize: 7 }} textAnchor="middle">{t}</Text>
      ))}
      {LOWER_TEETH.map((t, i) => (
        <Text key={t} x={6 + i * STEP + 12} y={125} style={{ fontSize: 7 }} textAnchor="middle">{t}</Text>
      ))}
    </Svg>
  );
}

interface RecordPdfProps {
  patient: Patient;
  visit: Visit;
  qrDataUrl?: string;
  siteUrl?: string;
}

export function RecordPdf({ patient, visit, qrDataUrl, siteUrl }: RecordPdfProps) {
  const id = patient.identification;
  const a = patient.anamnesis;
  const oh = visit.oralHealth;
  const ex = visit.clinicalExam;
  const annotated = [...UPPER_TEETH, ...LOWER_TEETH].filter((t) => visit.odontogram[t]);
  const usedConditions = TOOTH_CONDITIONS.filter((c) => c !== "healthy");

  return (
    <Document title={`Prontuário ${formatRecordNumber(patient.number)} - ${id.name}`} author={visit.dentist.name || "Odontra"}>
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <View>
            <Text style={s.dentist}>{visit.dentist.name || "Cirurgião-dentista"}</Text>
            <Text style={s.dentistSub}>{visit.dentist.cro ? `CRO ${visit.dentist.cro}` : "Cirurgião-dentista"}</Text>
          </View>
          <View>
            <Text style={s.title}>PRONTUÁRIO ODONTOLÓGICO</Text>
            <View style={s.numberBox}>
              <Text>Nº {formatRecordNumber(patient.number)}  ·  Consulta {visit.sequence}  ·  {formatDate(visit.date)}</Text>
            </View>
          </View>
        </View>

        <Bar title="Identificação do Paciente" />
        <View style={s.identWrap}>
          <View style={{ flex: 1 }}>
            <Row><Cell label="Nome" value={id.name} flex={3} /></Row>
            <Row>
              <Cell label="RG" value={id.rg} />
              <Cell label="Órgão expedidor" value={id.issuingBody} />
              <Cell label="CPF" value={id.cpf} />
            </Row>
            <Row>
              <Cell label="Naturalidade" value={id.birthplace} />
              <Cell label="Nacionalidade" value={id.nationality} />
              <Cell label="Estado civil" value={id.maritalStatus} />
            </Row>
            <Row>
              <Cell label="Data de nascimento" value={formatDate(id.birthDate)} />
              <Cell label="Sexo" value={id.sex === "F" ? "Feminino" : id.sex === "M" ? "Masculino" : ""} />
              <Cell label="Profissão" value={id.occupation} />
            </Row>
          </View>
          {patient.photo ? <Image src={patient.photo} style={s.photo} /> : null}
        </View>
        <Row><Cell label="Endereço residencial" value={id.homeAddress} flex={2} /><Cell label="Telefone" value={id.homePhone} /></Row>
        <Row><Cell label="Endereço profissional" value={id.workAddress} flex={2} /><Cell label="Telefone" value={id.workPhone} /></Row>
        <Row><Cell label="Indicação" value={id.referral} /><Cell label="Convênio" value={id.insurance} /><Cell label="Nº de inscrição" value={id.insuranceNumber} /></Row>
        <Row><Cell label="Contato para emergência" value={id.emergencyContact} flex={2} /><Cell label="Telefone" value={id.emergencyPhone} /></Row>

        <Bar title="Anamnese" />
        <TextBox label="Queixa principal e história da doença atual" value={a.chiefComplaint} minHeight={52} />
        <Row>
          <Cell label="Uso de medicação" value={`${yesNo(a.usesMedication)}${a.medication ? `   Qual: ${a.medication}` : ""}`} flex={2} />
          <Cell label="Pressão arterial" value={a.bloodPressure} />
        </Row>
        <Row><Cell label="Alergia" value={`${yesNo(a.allergy)}${a.allergyDetail ? `   Qual: ${a.allergyDetail}` : ""}`} /></Row>
        <Row><Cell label="Doença" value={yesNo(a.hasDisease)} /></Row>
        {a.diseaseCategories.length > 0 && (
          <View style={[s.chips, { marginBottom: 3 }]}>
            {a.diseaseCategories.map((d) => <Text key={d} style={s.chip}>{d}</Text>)}
          </View>
        )}
        {a.diseaseDetail ? <TextBox label="Especificar" value={a.diseaseDetail} minHeight={0} /> : null}
        <Row><Cell label="Passou por alguma cirurgia" value={`${yesNo(a.hadSurgery)}${a.surgeryDetail ? `   Qual: ${a.surgeryDetail}` : ""}`} /></Row>
        <Row>
          <Cell label="Quando se fere, o sangramento é" value={options(a.bleeding, [["normal", "Normal"], ["excessive", "Excessivo"]])} />
          <Cell label="Cicatrização" value={options(a.healing, [["normal", "Normal"], ["complicated", "Complicada"]])} />
        </Row>
        <Row>
          <Cell label="Sente falta de ar" value={`${yesNo(a.shortnessOfBreath)}${a.shortnessFrequency ? `   Freq.: ${a.shortnessFrequency}` : ""}`} />
          <Cell label="Gestante" value={`${yesNo(a.pregnant)}${a.pregnancyWeeks ? `   ${a.pregnancyWeeks} sem.` : ""}`} />
        </Row>
        {a.notes ? <TextBox label="Observações" value={a.notes} minHeight={0} /> : null}

        <Bar title="Saúde Bucal" />
        <Row><Cell label="Teve reação com anestesia dental" value={yesNo(oh.anesthesiaReaction)} /><Cell label="Sente dor nos dentes ou gengiva" value={yesNo(oh.toothOrGumPain)} /></Row>
        <Row><Cell label="Sangramento na gengiva" value={`${yesNo(oh.gumBleeding)}${oh.gumBleedingWhen ? `   Quando: ${oh.gumBleedingWhen}` : ""}`} /><Cell label="Sente gosto ruim ou boca seca" value={yesNo(oh.badTaste)} /></Row>
        <Row><Cell label="Costuma ranger os dentes" value={yesNo(oh.bruxism)} /><Cell label="Dor no maxilar ou ouvido" value={yesNo(oh.jawOrEarPain)} /></Row>
        <Row><Cell label="Último tratamento dentário" value={oh.lastTreatment} /><Cell label="Fumante" value={yesNo(oh.smoker)} /></Row>
        <Row><Cell label="Escova os dentes quantas vezes ao dia" value={oh.brushingPerDay} /><Cell label="Utiliza fio dental" value={yesNo(oh.flosses)} /></Row>

        <Bar title="Antecedentes Familiares" />
        <TextBox value={a.familyHistory} minHeight={40} />

        <Bar title="Exame Clínico" />
        <Row>
          <Cell label="Higiene" value={options(ex.hygiene, [["normal", "Normal"], ["regular", "Regular"], ["bad", "Ruim"]])} flex={2} />
          <Cell label="Língua" value={ex.tongue} />
        </Row>
        <Row>
          <Cell label="Halitose" value={options(ex.halitosis, [["absent", "Ausente"], ["moderate", "Moderada"], ["strong", "Forte"]])} flex={2} />
          <Cell label="Palato" value={ex.palate} />
        </Row>
        <Row>
          <Cell label="Tártaro" value={options(ex.tartar, [["absent", "Ausente"], ["little", "Pouco"], ["much", "Muito"]])} flex={2} />
          <Cell label="Assoalho bucal" value={ex.mouthFloor} />
        </Row>
        <Row>
          <Cell label="Gengiva" value={options(ex.gingiva, [["normal", "Normal"], ["gingivitis", "Gengivite"], ["periodontitis", "Periodontite"]])} flex={2} />
          <Cell label="Lábios" value={ex.lips} />
        </Row>
        <Row><Cell label="Mucosa" value={options(ex.mucosa, [["normal", "Normal"], ["altered", "Alterada"]])} /></Row>

        <Bar title="Odontograma" />
        <View wrap={false} style={{ alignItems: "center" }}>
          <OdontogramPdf odontogram={visit.odontogram} />
        </View>
        <View style={[s.chips, { marginTop: 4 }]} wrap={false}>
          {usedConditions.map((c) => (
            <View key={c} style={{ flexDirection: "row", alignItems: "center", marginRight: 10, marginBottom: 2 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: CONDITION_COLORS[c], borderWidth: 0.7, borderColor: TOOTH_STROKE, marginRight: 3 }} />
              <Text style={{ fontSize: 7 }}>{TOOTH_CONDITION_LABELS[c]}</Text>
            </View>
          ))}
        </View>
        {annotated.length > 0 && (
          <View style={{ marginTop: 4 }}>
            {annotated.map((t) => (
              <View key={t} style={s.toothNote} wrap={false}>
                <Text style={{ fontFamily: "Helvetica-Bold", width: 22 }}>{t}</Text>
                <Text>{TOOTH_CONDITION_LABELS[visit.odontogram[t].condition]}{visit.odontogram[t].note ? ` — ${visit.odontogram[t].note}` : ""}</Text>
              </View>
            ))}
          </View>
        )}

        <Bar title="Alterações / Procedimentos" />
        {visit.reason ? <TextBox label="Motivo da consulta" value={visit.reason} minHeight={0} /> : null}
        <TextBox value={visit.findings} minHeight={90} />

        <View style={s.signature} wrap={false}>
          <Text style={s.signatureLine}>Assinatura e carimbo do cirurgião-dentista</Text>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${id.name} · Prontuário Nº ${formatRecordNumber(patient.number)} · Página ${pageNumber}/${totalPages}`} />
          {qrDataUrl ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[s.footerText, { marginRight: 5, textAlign: "right" }]}>{siteUrl}</Text>
              <Image src={qrDataUrl} style={{ width: 30, height: 30 }} />
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
