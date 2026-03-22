"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { actualizarHistoriaClinica } from "../../actions";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Search, Brain } from "lucide-react";

interface PacienteOption { id: string; nombreCompleto: string; numeroDocumento: string; tipoDocumento: string; }

interface Historia {
  idOS: string; idPaciente: string; nombrePaciente: string;
  fechaHoraLlegadaEscena: string; fechaHoraAtencion: string;
  motivoConsulta: string; enfermedadActual: string; antecedentes: string; examenFisicoGeneral: string;
  signosVitales: { presionArterial: string; frecuenciaCardiaca: string; frecuenciaRespiratoria: string; temperatura: string; saturacionO2: string; glucometria: string; };
  glasgowOcular: number; glasgowVerbal: number; glasgowMotor: number;
  triage: string; diagnosticoPresuntivo: string;
  procedimientosRealizados: string; medicamentosAdministrados: string; notasEvolucion: string;
  firmaResponsable: string; fechaHoraCierre: string;
}

export default function EditarHistoriaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [hc, setHc] = useState<Historia | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [pacientes, setPacientes] = useState<PacienteOption[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteOption | null>(null);
  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const [gOcular, setGOcular] = useState(4);
  const [gVerbal, setGVerbal] = useState(5);
  const [gMotor, setGMotor] = useState(6);
  const glasgowTotal = gOcular + gVerbal + gMotor;

  useEffect(() => {
    async function cargar() {
      const [hcSnap, pSnap] = await Promise.all([
        getDoc(doc(db, "historias_clinicas", id)),
        getDocs(query(collection(db, "pacientes"), orderBy("primerNombre"))),
      ]);
      if (hcSnap.exists()) {
        const data = hcSnap.data() as Historia;
        setHc(data);
        setPacienteSeleccionado({ id: data.idPaciente, nombreCompleto: data.nombrePaciente, numeroDocumento: "", tipoDocumento: "" });
        setGOcular(data.glasgowOcular || 4);
        setGVerbal(data.glasgowVerbal || 5);
        setGMotor(data.glasgowMotor || 6);
      }
      setPacientes(pSnap.docs.map((d) => {
        const p = d.data();
        return { id: d.id, nombreCompleto: [p.primerNombre, p.segundoNombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(" "), numeroDocumento: p.numeroDocumento, tipoDocumento: p.tipoDocumento };
      }));
    }
    cargar();
  }, [id]);

  const pacientesFiltrados = pacientes.filter((p) => { if (!buscarPaciente) return true; const t = buscarPaciente.toLowerCase(); return p.nombreCompleto.toLowerCase().includes(t) || p.numeroDocumento.includes(t); });

  function glasgowColor() { if (glasgowTotal <= 8) return "var(--danger)"; if (glasgowTotal <= 12) return "var(--warning)"; return "var(--success)"; }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pacienteSeleccionado) { setError("Debe seleccionar un paciente."); return; }
    setPending(true); setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("id_paciente", pacienteSeleccionado.id);
    formData.set("nombre_paciente", pacienteSeleccionado.nombreCompleto);
    formData.set("glasgow_ocular", String(gOcular));
    formData.set("glasgow_verbal", String(gVerbal));
    formData.set("glasgow_motor", String(gMotor));
    const result = await actualizarHistoriaClinica(id, formData);
    if (result.error) { setError(result.error); setPending(false); }
    else router.push(`/dashboard/historias/${id}`);
  }

  if (!hc) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;
  const sv = hc.signosVitales || {} as Historia["signosVitales"];

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/dashboard/historias/${id}`} className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div><div className="topbar-title">Editar Historia Clínica</div><div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{hc.nombrePaciente}</div></div>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>⚠️ {error}</div>}

          {/* Paciente */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Paciente</h3>
            {pacienteSeleccionado ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--primary-light)", borderRadius: 8 }}>
                <div style={{ fontWeight: 600 }}>{pacienteSeleccionado.nombreCompleto}</div>
                <button type="button" className="btn btn-outline" onClick={() => { setPacienteSeleccionado(null); setBuscarPaciente(""); }} style={{ fontSize: "0.8rem" }}>Cambiar</button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} /><input className="form-input" value={buscarPaciente} onChange={(e) => { setBuscarPaciente(e.target.value); setMostrarLista(true); }} onFocus={() => setMostrarLista(true)} placeholder="Buscar paciente..." style={{ paddingLeft: 38 }} /></div>
                {mostrarLista && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, maxHeight: 200, overflowY: "auto", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{pacientesFiltrados.map((p) => (<div key={p.id} onClick={() => { setPacienteSeleccionado(p); setMostrarLista(false); }} style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-light)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}><div style={{ fontWeight: 500 }}>{p.nombreCompleto}</div><div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{p.tipoDocumento} {p.numeroDocumento}</div></div>))}</div>}
              </div>
            )}
          </div>

          {/* Tiempos */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Tiempos</h3>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Llegada</label><input name="fecha_hora_llegada" type="datetime-local" className="form-input" defaultValue={hc.fechaHoraLlegadaEscena?.slice(0, 16)} /></div>
              <div className="form-group"><label className="form-label">Atención</label><input name="fecha_hora_atencion" type="datetime-local" className="form-input" defaultValue={hc.fechaHoraAtencion?.slice(0, 16)} /></div>
              <div className="form-group"><label className="form-label">Cierre</label><input name="fecha_hora_cierre" type="datetime-local" className="form-input" defaultValue={hc.fechaHoraCierre?.slice(0, 16)} /></div>
            </div>
          </div>

          {/* Consulta */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Consulta</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Motivo</label><textarea name="motivo_consulta" className="form-textarea" defaultValue={hc.motivoConsulta} required style={{ minHeight: 70 }} /></div>
              <div className="form-group"><label className="form-label">Enfermedad Actual</label><textarea name="enfermedad_actual" className="form-textarea" defaultValue={hc.enfermedadActual} style={{ minHeight: 70 }} /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Antecedentes</label><textarea name="antecedentes" className="form-textarea" defaultValue={hc.antecedentes} style={{ minHeight: 70 }} /></div>
              <div className="form-group"><label className="form-label">Examen Físico</label><textarea name="examen_fisico" className="form-textarea" defaultValue={hc.examenFisicoGeneral} style={{ minHeight: 70 }} /></div>
            </div>
          </div>

          {/* Signos Vitales */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Signos Vitales</h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">P/A</label><input name="presion_arterial" className="form-input" defaultValue={sv.presionArterial} /></div>
              <div className="form-group"><label className="form-label">FC (lpm)</label><input name="frecuencia_cardiaca" className="form-input" defaultValue={sv.frecuenciaCardiaca} type="number" /></div>
              <div className="form-group"><label className="form-label">FR (rpm)</label><input name="frecuencia_respiratoria" className="form-input" defaultValue={sv.frecuenciaRespiratoria} type="number" /></div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">T° (°C)</label><input name="temperatura" className="form-input" defaultValue={sv.temperatura} /></div>
              <div className="form-group"><label className="form-label">SpO₂ (%)</label><input name="saturacion_o2" className="form-input" defaultValue={sv.saturacionO2} type="number" /></div>
              <div className="form-group"><label className="form-label">Glucometría</label><input name="glucometria" className="form-input" defaultValue={sv.glucometria} type="number" /></div>
            </div>
          </div>

          {/* Glasgow */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}><Brain size={16} /> Glasgow</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: `${glasgowColor()}15`, border: `2px solid ${glasgowColor()}` }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: glasgowColor() }}>{glasgowTotal}<span style={{ fontSize: "1rem", color: "var(--muted)" }}>/15</span></div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Ocular (1-4)</label><select className="form-select" value={gOcular} onChange={(e) => setGOcular(Number(e.target.value))}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></div>
              <div className="form-group"><label className="form-label">Verbal (1-5)</label><select className="form-select" value={gVerbal} onChange={(e) => setGVerbal(Number(e.target.value))}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option></select></div>
              <div className="form-group"><label className="form-label">Motor (1-6)</label><select className="form-select" value={gMotor} onChange={(e) => setGMotor(Number(e.target.value))}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option><option value={6}>6</option></select></div>
            </div>
          </div>

          {/* Triage + Diagnóstico */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Clasificación</h3>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Triage</label><select name="triage" className="form-select" defaultValue={hc.triage} required><option value="I">I</option><option value="II">II</option><option value="III">III</option><option value="IV">IV</option><option value="V">V</option></select></div>
              <div className="form-group"><label className="form-label">Diagnóstico</label><input name="diagnostico_presuntivo" className="form-input" defaultValue={hc.diagnosticoPresuntivo} /></div>
            </div>
          </div>

          {/* Procedimientos */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Tratamiento</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Procedimientos</label><textarea name="procedimientos_realizados" className="form-textarea" defaultValue={hc.procedimientosRealizados} style={{ minHeight: 70 }} /></div>
              <div className="form-group"><label className="form-label">Medicamentos</label><textarea name="medicamentos_administrados" className="form-textarea" defaultValue={hc.medicamentosAdministrados} style={{ minHeight: 70 }} /></div>
            </div>
            <div className="form-group"><label className="form-label">Notas Evolución</label><textarea name="notas_evolucion" className="form-textarea" defaultValue={hc.notasEvolucion} style={{ minHeight: 70 }} /></div>
          </div>

          {/* Cierre */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Responsable</h3>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Firma</label><input name="firma_responsable" className="form-input" defaultValue={hc.firmaResponsable} required /></div>
              <div className="form-group"><label className="form-label">ID Orden</label><input name="id_os" className="form-input" defaultValue={hc.idOS} /></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href={`/dashboard/historias/${id}`} className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}><Save size={15} /> {pending ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
