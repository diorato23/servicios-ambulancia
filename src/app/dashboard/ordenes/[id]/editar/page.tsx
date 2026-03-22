"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { actualizarOrden } from "../../actions";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Search } from "lucide-react";

interface PacienteOption {
  id: string;
  nombreCompleto: string;
  numeroDocumento: string;
  tipoDocumento: string;
}

interface Orden {
  id: string;
  fechaHoraSolicitud: string;
  canalSolicitud: string;
  nombreSolicitante: string;
  telefonoSolicitante: string;
  direccionOrigen: string;
  coordenadasOrigen: string;
  direccionDestino: string;
  coordenadasDestino: string;
  tipoServicio: string;
  tipoAmbulancia: string;
  prioridad: string;
  motivoSolicitud: string;
  idPaciente: string;
  nombrePaciente: string;
  estadoOS: string;
}

export default function EditarOrdenPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [orden, setOrden] = useState<Orden | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [pacientes, setPacientes] = useState<PacienteOption[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteOption | null>(null);
  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    async function cargar() {
      const [ordenSnap, pacientesSnap] = await Promise.all([
        getDoc(doc(db, "ordenes_servicio", id)),
        getDocs(query(collection(db, "pacientes"), orderBy("primerNombre"))),
      ]);
      if (ordenSnap.exists()) {
        const data = { id: ordenSnap.id, ...ordenSnap.data() } as Orden;
        setOrden(data);
        setPacienteSeleccionado({ id: data.idPaciente, nombreCompleto: data.nombrePaciente, numeroDocumento: "", tipoDocumento: "" });
      }
      setPacientes(
        pacientesSnap.docs.map((d) => {
          const p = d.data();
          return {
            id: d.id,
            nombreCompleto: [p.primerNombre, p.segundoNombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(" "),
            numeroDocumento: p.numeroDocumento,
            tipoDocumento: p.tipoDocumento,
          };
        })
      );
    }
    cargar();
  }, [id]);

  const pacientesFiltrados = pacientes.filter((p) => {
    if (!buscarPaciente) return true;
    const term = buscarPaciente.toLowerCase();
    return p.nombreCompleto.toLowerCase().includes(term) || p.numeroDocumento.includes(term);
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pacienteSeleccionado) { setError("Debe seleccionar un paciente."); return; }
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("id_paciente", pacienteSeleccionado.id);
    formData.set("nombre_paciente", pacienteSeleccionado.nombreCompleto);
    const result = await actualizarOrden(id, formData);
    if (result.error) { setError(result.error); setPending(false); }
    else router.push(`/dashboard/ordenes/${id}`);
  }

  if (!orden) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/dashboard/ordenes/${id}`} className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">Editar Orden</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{orden.tipoServicio}</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>⚠️ {error}</div>
          )}

          {/* Paciente */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Paciente</h3>
            {pacienteSeleccionado ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--primary-light, #e8f0fe)", borderRadius: 8 }}>
                <div><div style={{ fontWeight: 600 }}>{pacienteSeleccionado.nombreCompleto}</div></div>
                <button type="button" className="btn btn-outline" onClick={() => { setPacienteSeleccionado(null); setBuscarPaciente(""); }} style={{ fontSize: "0.8rem" }}>Cambiar</button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                  <input className="form-input" value={buscarPaciente} onChange={(e) => { setBuscarPaciente(e.target.value); setMostrarLista(true); }} onFocus={() => setMostrarLista(true)} placeholder="Buscar paciente..." style={{ paddingLeft: 38 }} />
                </div>
                {mostrarLista && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card-bg, #fff)", border: "1px solid var(--border)", borderRadius: 8, maxHeight: 200, overflowY: "auto", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {pacientesFiltrados.map((p) => (
                      <div key={p.id} onClick={() => { setPacienteSeleccionado(p); setMostrarLista(false); }} style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-light, #f0f0f0)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <div style={{ fontWeight: 500 }}>{p.nombreCompleto}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{p.tipoDocumento} {p.numeroDocumento}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Datos */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Datos de la Solicitud</h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Fecha y Hora</label><input name="fecha_hora_solicitud" type="datetime-local" className="form-input" defaultValue={orden.fechaHoraSolicitud?.slice(0, 16)} required /></div>
              <div className="form-group">
                <label className="form-label">Canal de Solicitud</label>
                <select name="canal_solicitud" className="form-select" defaultValue={orden.canalSolicitud} required>
                  <option value="Teléfono">Teléfono</option><option value="Radio">Radio</option><option value="Presencial">Presencial</option><option value="App">App</option><option value="Línea 123">Línea 123</option><option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select name="prioridad" className="form-select" defaultValue={orden.prioridad} required>
                  <option value="Alta">🔴 Alta</option><option value="Media">🟡 Media</option><option value="Baja">🟢 Baja</option>
                </select>
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Solicitante</label><input name="nombre_solicitante" className="form-input" defaultValue={orden.nombreSolicitante} /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input name="telefono_solicitante" className="form-input" defaultValue={orden.telefonoSolicitante} /></div>
            </div>
            <div className="form-group"><label className="form-label">Motivo</label><textarea name="motivo_solicitud" className="form-textarea" defaultValue={orden.motivoSolicitud} style={{ minHeight: 80 }} required /></div>
          </div>

          {/* Servicio */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Tipo de Servicio</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tipo de Servicio</label>
                <select name="tipo_servicio" className="form-select" defaultValue={orden.tipoServicio} required>
                  <option value="Emergencia">Emergencia</option><option value="Urgencia">Urgencia</option><option value="Traslado programado">Traslado Programado</option><option value="Traslado interinstitucional">Traslado Interinstitucional</option><option value="Evento especial">Evento Especial</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Ambulancia</label>
                <select name="tipo_ambulancia" className="form-select" defaultValue={orden.tipoAmbulancia}>
                  <option value="">Seleccionar...</option><option value="TAB">TAB</option><option value="TAM">TAM</option><option value="TAM-UCI">TAM-UCI</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ubicaciones */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Ubicaciones</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Dirección Origen</label><input name="direccion_origen" className="form-input" defaultValue={orden.direccionOrigen} required /></div>
              <div className="form-group"><label className="form-label">Coordenadas Origen</label><input name="coordenadas_origen" className="form-input" defaultValue={orden.coordenadasOrigen} /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Dirección Destino</label><input name="direccion_destino" className="form-input" defaultValue={orden.direccionDestino} /></div>
              <div className="form-group"><label className="form-label">Coordenadas Destino</label><input name="coordenadas_destino" className="form-input" defaultValue={orden.coordenadasDestino} /></div>
            </div>
          </div>

          {/* Estado */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Estado</h3>
            <select name="estado_os" className="form-select" defaultValue={orden.estadoOS} style={{ maxWidth: 250 }}>
              <option value="Pendiente">Pendiente</option><option value="En camino">En camino</option><option value="En escena">En escena</option><option value="En traslado">En traslado</option><option value="Completada">Completada</option><option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href={`/dashboard/ordenes/${id}`} className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}><Save size={15} />{pending ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
