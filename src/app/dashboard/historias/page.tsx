"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";

interface Historia extends DocumentData {
  id: string;
  nombrePaciente: string;
  motivoConsulta: string;
  triage: string;
  escalaGlasgow: number;
  diagnosticoPresuntivo: string;
  fechaHoraAtencion: string;
  firmaResponsable: string;
}

const triageBadge: Record<string, { className: string; label: string }> = {
  "I": { className: "badge-red", label: "I — Resucitación" },
  "II": { className: "badge-orange", label: "II — Emergencia" },
  "III": { className: "badge-yellow", label: "III — Urgencia" },
  "IV": { className: "badge-green", label: "IV — Menos urgente" },
  "V": { className: "badge-blue", label: "V — No urgente" },
};

export default function HistoriasPage() {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [buscar, setBuscar] = useState("");
  const [filtroTriage, setFiltroTriage] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "historias_clinicas"), orderBy("fechaRegistro", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setHistorias(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Historia[]);
      setCargando(false);
    }, () => setCargando(false));
    return () => unsub();
  }, []);

  const filtrados = historias.filter((h) => {
    if (filtroTriage && h.triage !== filtroTriage) return false;
    if (!buscar) return true;
    const term = buscar.toLowerCase();
    return h.nombrePaciente?.toLowerCase().includes(term) || h.diagnosticoPresuntivo?.toLowerCase().includes(term) || h.motivoConsulta?.toLowerCase().includes(term);
  });

  const contadores = {
    total: historias.length,
    triageI_II: historias.filter((h) => h.triage === "I" || h.triage === "II").length,
    triageIII: historias.filter((h) => h.triage === "III").length,
    triageIV_V: historias.filter((h) => h.triage === "IV" || h.triage === "V").length,
  };

  function glasgowColor(g: number) {
    if (g <= 8) return "var(--danger)";
    if (g <= 12) return "var(--warning)";
    return "var(--success)";
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Historias Clínicas APH</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>Registros de atención prehospitalaria</div>
        </div>
        <Link href="/dashboard/historias/nueva" className="btn btn-primary"><Plus size={15} /> Nueva Historia</Link>
      </div>

      <div className="page-content">
        {/* Contadores */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Total Registros</div>
            <div className="stat-value">{contadores.total}</div>
          </div>
          <div className="stat-card" onClick={() => setFiltroTriage("I")} style={{ cursor: "pointer" }}>
            <div className="stat-label">Triage I-II (Críticos)</div>
            <div className="stat-value" style={{ color: "var(--danger)" }}>{contadores.triageI_II}</div>
          </div>
          <div className="stat-card" onClick={() => setFiltroTriage("III")} style={{ cursor: "pointer" }}>
            <div className="stat-label">Triage III (Urgencia)</div>
            <div className="stat-value" style={{ color: "var(--warning)" }}>{contadores.triageIII}</div>
          </div>
          <div className="stat-card" onClick={() => setFiltroTriage("IV")} style={{ cursor: "pointer" }}>
            <div className="stat-label">Triage IV-V</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{contadores.triageIV_V}</div>
          </div>
        </div>

        {/* Buscador */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input className="form-input" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar por paciente, diagnóstico, motivo..." style={{ paddingLeft: 38 }} />
            </div>
            <select className="form-select" value={filtroTriage} onChange={(e) => setFiltroTriage(e.target.value)} style={{ width: 200 }}>
              <option value="">Todos los triage</option>
              <option value="I">I — Resucitación</option>
              <option value="II">II — Emergencia</option>
              <option value="III">III — Urgencia</option>
              <option value="IV">IV — Menos urgente</option>
              <option value="V">V — No urgente</option>
            </select>
            {(buscar || filtroTriage) && <button className="btn btn-outline" onClick={() => { setBuscar(""); setFiltroTriage(""); }}>Limpiar</button>}
          </div>
        </div>

        {/* Tabla */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <strong>{cargando ? "Cargando..." : filtrados.length === 0 ? "Sin resultados" : `${filtrados.length} historia${filtrados.length !== 1 ? "s" : ""}`}</strong>
          </div>
          {!cargando && filtrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}>
              <FileText size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
              <p style={{ fontSize: "0.875rem" }}>Aún no hay historias clínicas registradas.</p>
              <Link href="/dashboard/historias/nueva" className="btn btn-primary" style={{ marginTop: 16 }}>Registrar primera historia</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Triage</th>
                    <th>Glasgow</th>
                    <th>Motivo</th>
                    <th>Diagnóstico</th>
                    <th>Fecha</th>
                    <th>Responsable</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>{h.nombrePaciente || "—"}</td>
                      <td><span className={`badge ${triageBadge[h.triage]?.className || "badge-gray"}`}>{triageBadge[h.triage]?.label || h.triage || "—"}</span></td>
                      <td><span style={{ fontWeight: 700, fontSize: "0.95rem", color: glasgowColor(h.escalaGlasgow) }}>{h.escalaGlasgow || "—"}/15</span></td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem" }}>{h.motivoConsulta || "—"}</td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem" }}>{h.diagnosticoPresuntivo || "—"}</td>
                      <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{h.fechaHoraAtencion ? new Date(h.fechaHoraAtencion).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td style={{ fontSize: "0.85rem" }}>{h.firmaResponsable || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={`/dashboard/historias/${h.id}`} className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>Ver</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
