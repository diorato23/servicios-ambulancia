"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, MapPin, Phone, User, Clock } from "lucide-react";
import { eliminarOrden, actualizarEstadoOrden } from "../actions";
import { useUserRole } from "@/lib/useUserRole";

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

const estados = ["Pendiente", "En camino", "En escena", "En traslado", "Completada", "Cancelada"];

const estadoColor: Record<string, string> = {
  Pendiente: "var(--warning)",
  "En camino": "var(--primary)",
  "En escena": "#e67e22",
  "En traslado": "#8e44ad",
  Completada: "var(--success)",
  Cancelada: "var(--danger)",
};

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: "0.9rem", color: value ? "var(--foreground)" : "var(--muted)" }}>{value || "—"}</div>
    </div>
  );
}

export default function DetalleOrdenPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [orden, setOrden] = useState<Orden | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const { isConductor } = useUserRole();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "ordenes_servicio", id), (snap) => {
      if (snap.exists()) setOrden({ id: snap.id, ...snap.data() } as Orden);
    });
    return () => unsub();
  }, [id]);

  async function handleEliminar() {
    if (!confirm("¿Está seguro de eliminar esta orden? Esta acción no se puede deshacer.")) return;
    setEliminando(true);
    const result = await eliminarOrden(id);
    if (result.error) { alert(result.error); setEliminando(false); }
    else router.push("/dashboard/ordenes");
  }

  async function handleCambiarEstado(nuevoEstado: string) {
    setCambiandoEstado(true);
    const result = await actualizarEstadoOrden(id, nuevoEstado);
    if (result.error) alert(result.error);
    setCambiandoEstado(false);
  }

  if (!orden) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/ordenes" className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">Orden de Servicio</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{orden.tipoServicio} — {orden.prioridad}</div>
          </div>
        </div>
        {!isConductor && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleEliminar} disabled={eliminando} className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
              {eliminando ? "Eliminando..." : "Eliminar"}
            </button>
            <Link href={`/dashboard/ordenes/${id}/editar`} className="btn btn-primary"><Edit size={15} /> Editar</Link>
          </div>
        )}
      </div>

      <div className="page-content">
        {/* Estado con botones de cambio */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Estado de la Orden</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {estados.map((e) => (
              <button
                key={e}
                onClick={() => handleCambiarEstado(e)}
                disabled={isConductor || cambiandoEstado || orden.estadoOS === e}
                className="btn"
                style={{
                  background: orden.estadoOS === e ? estadoColor[e] : "transparent",
                  color: orden.estadoOS === e ? "#fff" : estadoColor[e],
                  border: `2px solid ${estadoColor[e]}`,
                  fontWeight: orden.estadoOS === e ? 700 : 500,
                  opacity: cambiandoEstado ? 0.6 : 1,
                  fontSize: "0.82rem",
                  padding: "6px 16px",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid-2" style={{ marginBottom: 20, gap: 20 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <User size={16} /> Paciente
            </h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{orden.nombrePaciente || "—"}</div>
            </div>
            {orden.idPaciente && (
              <Link href={`/dashboard/pacientes/${orden.idPaciente}`} className="btn btn-outline" style={{ fontSize: "0.8rem" }}>Ver ficha del paciente</Link>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Phone size={16} /> Solicitante
            </h3>
            <div className="grid-2" style={{ gap: 16 }}>
              <InfoField label="Nombre" value={orden.nombreSolicitante} />
              <InfoField label="Teléfono" value={orden.telefonoSolicitante} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} /> Datos de la Solicitud
          </h3>
          <div className="grid-3" style={{ gap: 20, marginBottom: 16 }}>
            <InfoField label="Fecha y Hora" value={orden.fechaHoraSolicitud ? new Date(orden.fechaHoraSolicitud).toLocaleString("es-CO") : null} />
            <InfoField label="Canal" value={orden.canalSolicitud} />
            <InfoField label="Prioridad" value={orden.prioridad} />
          </div>
          <div className="grid-2" style={{ gap: 20, marginBottom: 16 }}>
            <InfoField label="Tipo de Servicio" value={orden.tipoServicio} />
            <InfoField label="Tipo de Ambulancia" value={orden.tipoAmbulancia} />
          </div>
          <InfoField label="Motivo de la Solicitud" value={orden.motivoSolicitud} />
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={16} /> Ubicaciones
          </h3>
          <div className="grid-2" style={{ gap: 20 }}>
            <div>
              <InfoField label="Dirección de Origen" value={orden.direccionOrigen} />
              {orden.coordenadasOrigen && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>📍 {orden.coordenadasOrigen}</div>}
            </div>
            <div>
              <InfoField label="Dirección de Destino" value={orden.direccionDestino} />
              {orden.coordenadasDestino && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>📍 {orden.coordenadasDestino}</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
