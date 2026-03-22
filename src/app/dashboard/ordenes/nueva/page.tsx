"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { crearOrden } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Search } from "lucide-react";

interface PacienteOption {
  id: string;
  nombreCompleto: string;
  numeroDocumento: string;
  tipoDocumento: string;
}

export default function NuevaOrdenPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [pacientes, setPacientes] = useState<PacienteOption[]>([]);
  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteOption | null>(null);
  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    async function cargar() {
      const q = query(collection(db, "pacientes"), orderBy("primerNombre"));
      const snap = await getDocs(q);
      setPacientes(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nombreCompleto: [data.primerNombre, data.segundoNombre, data.primerApellido, data.segundoApellido].filter(Boolean).join(" "),
            numeroDocumento: data.numeroDocumento,
            tipoDocumento: data.tipoDocumento,
          };
        })
      );
    }
    cargar();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) => {
    if (!buscarPaciente) return true;
    const term = buscarPaciente.toLowerCase();
    return p.nombreCompleto.toLowerCase().includes(term) || p.numeroDocumento.includes(term);
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pacienteSeleccionado) {
      setError("Debe seleccionar un paciente.");
      return;
    }
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("id_paciente", pacienteSeleccionado.id);
    formData.set("nombre_paciente", pacienteSeleccionado.nombreCompleto);
    const result = await crearOrden(formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push("/dashboard/ordenes");
    }
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/ordenes" className="btn btn-outline" style={{ padding: "6px 12px" }}>
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="topbar-title">Nueva Orden de Servicio</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>Registrar solicitud de ambulancia</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Paciente */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              Paciente <span className="required">*</span>
            </h3>
            {pacienteSeleccionado ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--primary-light, #e8f0fe)", borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{pacienteSeleccionado.nombreCompleto}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{pacienteSeleccionado.tipoDocumento} {pacienteSeleccionado.numeroDocumento}</div>
                </div>
                <button type="button" className="btn btn-outline" onClick={() => { setPacienteSeleccionado(null); setBuscarPaciente(""); }} style={{ fontSize: "0.8rem" }}>Cambiar</button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                  <input
                    className="form-input"
                    value={buscarPaciente}
                    onChange={(e) => { setBuscarPaciente(e.target.value); setMostrarLista(true); }}
                    onFocus={() => setMostrarLista(true)}
                    placeholder="Buscar paciente por nombre o documento..."
                    style={{ paddingLeft: 38 }}
                  />
                </div>
                {mostrarLista && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card-bg, #fff)", border: "1px solid var(--border)", borderRadius: 8, maxHeight: 200, overflowY: "auto", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {pacientesFiltrados.length === 0 ? (
                      <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                        No se encontró el paciente.{" "}
                        <Link href="/dashboard/pacientes/nuevo" style={{ color: "var(--primary)" }}>Registrar nuevo</Link>
                      </div>
                    ) : (
                      pacientesFiltrados.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { setPacienteSeleccionado(p); setMostrarLista(false); setBuscarPaciente(""); }}
                          style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-light, #f0f0f0)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ fontWeight: 500 }}>{p.nombreCompleto}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{p.tipoDocumento} {p.numeroDocumento}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Datos de la Solicitud */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Datos de la Solicitud</h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Fecha y Hora <span className="required">*</span></label>
                <input name="fecha_hora_solicitud" type="datetime-local" className="form-input" defaultValue={new Date().toISOString().slice(0, 16)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Canal de Solicitud <span className="required">*</span></label>
                <select name="canal_solicitud" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Teléfono">Teléfono</option>
                  <option value="Radio">Radio</option>
                  <option value="Presencial">Presencial</option>
                  <option value="App">Aplicación Móvil</option>
                  <option value="Línea 123">Línea 123</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prioridad <span className="required">*</span></label>
                <select name="prioridad" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Alta">🔴 Alta — Emergencia vital</option>
                  <option value="Media">🟡 Media — Urgencia</option>
                  <option value="Baja">🟢 Baja — Traslado programado</option>
                </select>
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Nombre del Solicitante</label>
                <input name="nombre_solicitante" className="form-input" placeholder="Quien llama o solicita" />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono del Solicitante</label>
                <input name="telefono_solicitante" className="form-input" placeholder="Ej: 3001234567" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Motivo de la Solicitud <span className="required">*</span></label>
              <textarea name="motivo_solicitud" className="form-textarea" placeholder="Descripción del motivo de la solicitud..." style={{ minHeight: 80 }} required />
            </div>
          </div>

          {/* Servicio */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Tipo de Servicio</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tipo de Servicio <span className="required">*</span></label>
                <select name="tipo_servicio" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Emergencia">Emergencia</option>
                  <option value="Urgencia">Urgencia</option>
                  <option value="Traslado programado">Traslado Programado</option>
                  <option value="Traslado interinstitucional">Traslado Interinstitucional</option>
                  <option value="Evento especial">Evento Especial (cobertura)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Ambulancia</label>
                <select name="tipo_ambulancia" className="form-select">
                  <option value="">Seleccionar...</option>
                  <option value="TAB">TAB — Transporte Asistencial Básico</option>
                  <option value="TAM">TAM — Transporte Asistencial Medicalizado</option>
                  <option value="TAM-UCI">TAM-UCI — Cuidados Intensivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ubicaciones */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Ubicaciones</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Dirección de Origen <span className="required">*</span></label>
                <input name="direccion_origen" className="form-input" placeholder="Ej: Calle 80 # 45-23, Medellín" required />
              </div>
              <div className="form-group">
                <label className="form-label">Coordenadas Origen</label>
                <input name="coordenadas_origen" className="form-input" placeholder="Ej: 6.2442, -75.5812" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Dirección de Destino</label>
                <input name="direccion_destino" className="form-input" placeholder="Ej: Hospital San Vicente, Medellín" />
              </div>
              <div className="form-group">
                <label className="form-label">Coordenadas Destino</label>
                <input name="coordenadas_destino" className="form-input" placeholder="Ej: 6.2518, -75.5636" />
              </div>
            </div>
          </div>

          {/* Estado */}
          <input type="hidden" name="estado_os" value="Pendiente" />

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/dashboard/ordenes" className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}>
              <Save size={15} />
              {pending ? "Guardando..." : "Crear Orden"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
