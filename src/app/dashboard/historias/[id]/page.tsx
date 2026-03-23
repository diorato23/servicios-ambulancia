"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, Brain, Stethoscope, Clock, ShieldCheck } from "lucide-react";

interface SignosVitales {
  presionArterial: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  temperatura: string;
  saturacionO2: string;
  glucometria: string;
}

interface Historia {
  id: string;
  idOS: string;
  idPaciente: string;
  nombrePaciente: string;
  fechaHoraLlegadaEscena: string;
  fechaHoraAtencion: string;
  motivoConsulta: string;
  enfermedadActual: string;
  antecedentes: string;
  examenFisicoGeneral: string;
  signosVitales: SignosVitales;
  escalaGlasgow: number;
  glasgowOcular: number;
  glasgowVerbal: number;
  glasgowMotor: number;
  triage: string;
  diagnosticoPresuntivo: string;
  procedimientosRealizados: string;
  medicamentosAdministrados: string;
  notasEvolucion: string;
  firmaResponsable: string;
  fechaHoraCierre: string;
}

const triageInfo: Record<string, { color: string; label: string }> = {
  "I": { color: "var(--danger)", label: "I — Resucitación" },
  "II": { color: "#c2410c", label: "II — Emergencia" },
  "III": { color: "var(--warning)", label: "III — Urgencia" },
  "IV": { color: "var(--success)", label: "IV — Menos urgente" },
  "V": { color: "var(--primary)", label: "V — No urgente" },
};

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: "0.9rem", color: value ? "var(--foreground)" : "var(--muted)", whiteSpace: "pre-wrap" }}>{value || "—"}</div>
    </div>
  );
}

function VitalCard({ label, value, unit }: { label: string; value?: string; unit?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "14px 12px", background: "var(--muted-light)", borderRadius: 10 }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: "1.3rem", fontWeight: 700, color: value ? "var(--foreground)" : "var(--muted)" }}>{value || "—"}</div>
      {unit && value && <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>{unit}</div>}
    </div>
  );
}

export default function DetalleHistoriaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [hc, setHc] = useState<Historia | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "historias_clinicas", id), (snap) => {
      if (snap.exists()) setHc({ id: snap.id, ...snap.data() } as Historia);
    });
    return () => unsub();
  }, [id]);



  if (!hc) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;

  function glasgowColor() {
    if (hc!.escalaGlasgow <= 8) return "var(--danger)";
    if (hc!.escalaGlasgow <= 12) return "var(--warning)";
    return "var(--success)";
  }

  const sv = hc.signosVitales || {} as SignosVitales;
  const tri = triageInfo[hc.triage] || { color: "var(--muted)", label: hc.triage };

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/historias" className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">Historia Clínica APH</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{hc.nombrePaciente}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            <ShieldCheck size={14} /> Registro inmutable
          </span>
        </div>
      </div>

      <div className="page-content">
        {/* Header: Paciente + Triage + Glasgow */}
        <div className="grid-3" style={{ marginBottom: 20, gap: 20 }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: tri.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
              {hc.nombrePaciente?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{hc.nombrePaciente}</div>
              {hc.idPaciente && <Link href={`/dashboard/pacientes/${hc.idPaciente}`} style={{ fontSize: "0.8rem", color: "var(--primary)" }}>Ver ficha →</Link>}
            </div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Triage</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: tri.color }}>{tri.label}</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Glasgow</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: glasgowColor() }}>{hc.escalaGlasgow}<span style={{ fontSize: "1rem", color: "var(--muted)" }}>/15</span></div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>O:{hc.glasgowOcular} V:{hc.glasgowVerbal} M:{hc.glasgowMotor}</div>
          </div>
        </div>

        {/* Tiempos */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}><Clock size={16} /> Tiempos</h3>
          <div className="grid-3">
            <InfoField label="Llegada a Escena" value={hc.fechaHoraLlegadaEscena ? new Date(hc.fechaHoraLlegadaEscena).toLocaleString("es-CO") : null} />
            <InfoField label="Inicio Atención" value={hc.fechaHoraAtencion ? new Date(hc.fechaHoraAtencion).toLocaleString("es-CO") : null} />
            <InfoField label="Cierre" value={hc.fechaHoraCierre ? new Date(hc.fechaHoraCierre).toLocaleString("es-CO") : null} />
          </div>
        </div>

        {/* Signos Vitales */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}><Activity size={16} /> Signos Vitales</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            <VitalCard label="P/A" value={sv.presionArterial} unit="mmHg" />
            <VitalCard label="FC" value={sv.frecuenciaCardiaca} unit="lpm" />
            <VitalCard label="FR" value={sv.frecuenciaRespiratoria} unit="rpm" />
            <VitalCard label="T°" value={sv.temperatura} unit="°C" />
            <VitalCard label="SpO₂" value={sv.saturacionO2} unit="%" />
            <VitalCard label="Gluc" value={sv.glucometria} unit="mg/dL" />
          </div>
        </div>

        {/* Consulta */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}><Stethoscope size={16} /> Consulta</h3>
          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            <InfoField label="Motivo de Consulta" value={hc.motivoConsulta} />
            <InfoField label="Enfermedad / Trauma Actual" value={hc.enfermedadActual} />
          </div>
          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            <InfoField label="Antecedentes" value={hc.antecedentes} />
            <InfoField label="Examen Físico" value={hc.examenFisicoGeneral} />
          </div>
          <InfoField label="Diagnóstico Presuntivo" value={hc.diagnosticoPresuntivo} />
        </div>

        {/* Tratamiento */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Procedimientos y Tratamiento</h3>
          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            <InfoField label="Procedimientos Realizados" value={hc.procedimientosRealizados} />
            <InfoField label="Medicamentos Administrados" value={hc.medicamentosAdministrados} />
          </div>
          <InfoField label="Notas de Evolución" value={hc.notasEvolucion} />
        </div>

        {/* Cierre */}
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Responsable</h3>
          <div className="grid-2">
            <InfoField label="Firma / Responsable" value={hc.firmaResponsable} />
            <InfoField label="Orden Vinculada" value={hc.idOS} />
          </div>
        </div>
      </div>
    </>
  );
}
