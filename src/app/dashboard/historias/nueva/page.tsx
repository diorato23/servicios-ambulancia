"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { crearHistoriaClinica } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Search, Activity, Brain, Stethoscope } from "lucide-react";

interface PacienteOption {
  id: string;
  nombreCompleto: string;
  numeroDocumento: string;
  tipoDocumento: string;
}

export default function NuevaHistoriaPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [pacientes, setPacientes] = useState<PacienteOption[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteOption | null>(null);
  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);

  // Glasgow interativo
  const [gOcular, setGOcular] = useState(4);
  const [gVerbal, setGVerbal] = useState(5);
  const [gMotor, setGMotor] = useState(6);
  const glasgowTotal = gOcular + gVerbal + gMotor;

  useEffect(() => {
    async function cargar() {
      const q = query(collection(db, "pacientes"), orderBy("primerNombre"));
      const snap = await getDocs(q);
      setPacientes(snap.docs.map((d) => {
        const p = d.data();
        return { id: d.id, nombreCompleto: [p.primerNombre, p.segundoNombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(" "), numeroDocumento: p.numeroDocumento, tipoDocumento: p.tipoDocumento };
      }));
    }
    cargar();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) => {
    if (!buscarPaciente) return true;
    const term = buscarPaciente.toLowerCase();
    return p.nombreCompleto.toLowerCase().includes(term) || p.numeroDocumento.includes(term);
  });

  function glasgowColor() {
    if (glasgowTotal <= 8) return "var(--danger)";
    if (glasgowTotal <= 12) return "var(--warning)";
    return "var(--success)";
  }

  function glasgowLabel() {
    if (glasgowTotal <= 8) return "Severo — Intubación probable";
    if (glasgowTotal <= 12) return "Moderado — Monitoreo continuo";
    return "Leve — Buen pronóstico";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pacienteSeleccionado) { setError("Debe seleccionar un paciente."); return; }
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("id_paciente", pacienteSeleccionado.id);
    formData.set("nombre_paciente", pacienteSeleccionado.nombreCompleto);
    formData.set("glasgow_ocular", String(gOcular));
    formData.set("glasgow_verbal", String(gVerbal));
    formData.set("glasgow_motor", String(gMotor));
    const result = await crearHistoriaClinica(formData);
    if (result.error) { setError(result.error); setPending(false); }
    else router.push("/dashboard/historias");
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/historias" className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">Nueva Historia Clínica APH</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>Registro de atención prehospitalaria</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>⚠️ {error}</div>}

          {/* 1. Paciente */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Paciente <span className="required">*</span></h3>
            {pacienteSeleccionado ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--primary-light)", borderRadius: 8 }}>
                <div><div style={{ fontWeight: 600 }}>{pacienteSeleccionado.nombreCompleto}</div><div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{pacienteSeleccionado.tipoDocumento} {pacienteSeleccionado.numeroDocumento}</div></div>
                <button type="button" className="btn btn-outline" onClick={() => { setPacienteSeleccionado(null); setBuscarPaciente(""); }} style={{ fontSize: "0.8rem" }}>Cambiar</button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} /><input className="form-input" value={buscarPaciente} onChange={(e) => { setBuscarPaciente(e.target.value); setMostrarLista(true); }} onFocus={() => setMostrarLista(true)} placeholder="Buscar paciente..." style={{ paddingLeft: 38 }} /></div>
                {mostrarLista && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, maxHeight: 200, overflowY: "auto", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {pacientesFiltrados.length === 0 ? <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>No encontrado. <Link href="/dashboard/pacientes/nuevo" style={{ color: "var(--primary)" }}>Registrar</Link></div> : pacientesFiltrados.map((p) => (
                      <div key={p.id} onClick={() => { setPacienteSeleccionado(p); setMostrarLista(false); }} style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-light)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <div style={{ fontWeight: 500 }}>{p.nombreCompleto}</div><div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{p.tipoDocumento} {p.numeroDocumento}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Tiempos */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Tiempos de Atención</h3>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Llegada a Escena</label><input name="fecha_hora_llegada" type="datetime-local" className="form-input" defaultValue={new Date().toISOString().slice(0, 16)} /></div>
              <div className="form-group"><label className="form-label">Inicio Atención</label><input name="fecha_hora_atencion" type="datetime-local" className="form-input" defaultValue={new Date().toISOString().slice(0, 16)} /></div>
              <div className="form-group"><label className="form-label">Cierre Historia</label><input name="fecha_hora_cierre" type="datetime-local" className="form-input" /></div>
            </div>
          </div>

          {/* 3. Motivo y Enfermedad */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Stethoscope size={16} /> Consulta
            </h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Motivo de Consulta <span className="required">*</span></label><textarea name="motivo_consulta" className="form-textarea" placeholder="Motivo principal de la consulta..." required style={{ minHeight: 70 }} /></div>
              <div className="form-group"><label className="form-label">Enfermedad / Trauma Actual</label><textarea name="enfermedad_actual" className="form-textarea" placeholder="Descripción de la situación clínica..." style={{ minHeight: 70 }} /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Antecedentes</label><textarea name="antecedentes" className="form-textarea" placeholder="Alergias, medicamentos, patologías previas..." style={{ minHeight: 70 }} /></div>
              <div className="form-group"><label className="form-label">Examen Físico General</label><textarea name="examen_fisico" className="form-textarea" placeholder="Hallazgos del examen físico..." style={{ minHeight: 70 }} /></div>
            </div>
          </div>

          {/* 4. Signos Vitales */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} /> Signos Vitales
            </h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Presión Arterial</label><input name="presion_arterial" className="form-input" placeholder="Ej: 120/80" /></div>
              <div className="form-group"><label className="form-label">Frec. Cardíaca (lpm)</label><input name="frecuencia_cardiaca" className="form-input" placeholder="Ej: 80" type="number" /></div>
              <div className="form-group"><label className="form-label">Frec. Respiratoria (rpm)</label><input name="frecuencia_respiratoria" className="form-input" placeholder="Ej: 18" type="number" /></div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Temperatura (°C)</label><input name="temperatura" className="form-input" placeholder="Ej: 36.5" /></div>
              <div className="form-group"><label className="form-label">Saturación O₂ (%)</label><input name="saturacion_o2" className="form-input" placeholder="Ej: 98" type="number" /></div>
              <div className="form-group"><label className="form-label">Glucometría (mg/dL)</label><input name="glucometria" className="form-input" placeholder="Ej: 90" type="number" /></div>
            </div>
          </div>

          {/* 5. Glasgow */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Brain size={16} /> Escala de Glasgow
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, padding: "16px 20px", borderRadius: 12, background: `${glasgowColor()}15`, border: `2px solid ${glasgowColor()}` }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: glasgowColor() }}>{glasgowTotal}</div>
              <div><div style={{ fontWeight: 700, fontSize: "1rem", color: glasgowColor() }}>/15</div><div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 2 }}>{glasgowLabel()}</div></div>
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Respuesta Ocular (1-4)</label>
                <select className="form-select" value={gOcular} onChange={(e) => setGOcular(Number(e.target.value))}>
                  <option value={1}>1 — Ninguna</option><option value={2}>2 — Al dolor</option><option value={3}>3 — Al habla</option><option value={4}>4 — Espontánea</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Respuesta Verbal (1-5)</label>
                <select className="form-select" value={gVerbal} onChange={(e) => setGVerbal(Number(e.target.value))}>
                  <option value={1}>1 — Ninguna</option><option value={2}>2 — Sonidos incomprensibles</option><option value={3}>3 — Palabras inapropiadas</option><option value={4}>4 — Confuso</option><option value={5}>5 — Orientado</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Respuesta Motora (1-6)</label>
                <select className="form-select" value={gMotor} onChange={(e) => setGMotor(Number(e.target.value))}>
                  <option value={1}>1 — Ninguna</option><option value={2}>2 — Extensión</option><option value={3}>3 — Flexión anormal</option><option value={4}>4 — Retirada al dolor</option><option value={5}>5 — Localiza dolor</option><option value={6}>6 — Obedece órdenes</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. Triage y Diagnóstico */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Clasificación y Diagnóstico</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Triage <span className="required">*</span></label>
                <select name="triage" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="I">🔴 I — Resucitación (inmediata)</option>
                  <option value="II">🟠 II — Emergencia (min)</option>
                  <option value="III">🟡 III — Urgencia (30 min)</option>
                  <option value="IV">🟢 IV — Menos urgente (1-2 h)</option>
                  <option value="V">🔵 V — No urgente</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Diagnóstico Presuntivo</label><input name="diagnostico_presuntivo" className="form-input" placeholder="Ej: Infarto Agudo de Miocardio" /></div>
            </div>
          </div>

          {/* 7. Procedimientos y Medicamentos */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Procedimientos y Tratamiento</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Procedimientos Realizados</label><textarea name="procedimientos_realizados" className="form-textarea" placeholder="Ej: Inmovilización cervical, canalización IV..." style={{ minHeight: 80 }} /></div>
              <div className="form-group"><label className="form-label">Medicamentos Administrados</label><textarea name="medicamentos_administrados" className="form-textarea" placeholder="Ej: SSN 500ml IV, Morfina 2mg IV..." style={{ minHeight: 80 }} /></div>
            </div>
            <div className="form-group"><label className="form-label">Notas de Evolución</label><textarea name="notas_evolucion" className="form-textarea" placeholder="Observaciones y evolución durante el traslado..." style={{ minHeight: 80 }} /></div>
          </div>

          {/* 8. Cierre */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Cierre y Responsable</h3>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Firma / Responsable <span className="required">*</span></label><input name="firma_responsable" className="form-input" placeholder="Nombre del profesional responsable" required /></div>
              <div className="form-group"><label className="form-label">ID Orden de Servicio</label><input name="id_os" className="form-input" placeholder="ID de la orden vinculada (opcional)" /></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/dashboard/historias" className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}><Save size={15} /> {pending ? "Guardando..." : "Crear Historia Clínica"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
