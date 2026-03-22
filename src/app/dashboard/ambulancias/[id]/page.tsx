"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Truck } from "lucide-react";
import { eliminarAmbulancia, actualizarEstadoAmbulancia } from "../actions";

interface Ambulancia {
  id: string;
  placa: string;
  tipoAmbulancia: string;
  marca: string;
  modelo: string;
  anio: string;
  estado: string;
  dotacionBaseAsignada: string;
  capacidadOxigeno: string;
  gpsId: string;
}

const estados = ["Disponible", "En servicio", "En mantenimiento", "Fuera de servicio"];
const estadoColor: Record<string, string> = {
  Disponible: "var(--success)",
  "En servicio": "var(--primary)",
  "En mantenimiento": "var(--warning)",
  "Fuera de servicio": "var(--danger)",
};

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: "0.9rem", color: value ? "var(--foreground)" : "var(--muted)" }}>{value || "—"}</div>
    </div>
  );
}

export default function DetalleAmbulanciaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [amb, setAmb] = useState<Ambulancia | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "ambulancias", id), (snap) => {
      if (snap.exists()) setAmb({ id: snap.id, ...snap.data() } as Ambulancia);
    });
    return () => unsub();
  }, [id]);

  async function handleEliminar() {
    if (!confirm("¿Eliminar esta ambulancia? Esta acción no se puede deshacer.")) return;
    setEliminando(true);
    const result = await eliminarAmbulancia(id);
    if (result.error) { alert(result.error); setEliminando(false); }
    else router.push("/dashboard/ambulancias");
  }

  async function handleCambiarEstado(nuevoEstado: string) {
    setCambiandoEstado(true);
    const result = await actualizarEstadoAmbulancia(id, nuevoEstado);
    if (result.error) alert(result.error);
    setCambiandoEstado(false);
  }

  if (!amb) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/ambulancias" className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Truck size={20} /> {amb.placa}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{amb.tipoAmbulancia} — {amb.marca} {amb.modelo}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleEliminar} disabled={eliminando} className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
          <Link href={`/dashboard/ambulancias/${id}/editar`} className="btn btn-primary"><Edit size={15} /> Editar</Link>
        </div>
      </div>

      <div className="page-content">
        {/* Estado */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Estado de la Ambulancia</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {estados.map((e) => (
              <button key={e} onClick={() => handleCambiarEstado(e)} disabled={cambiandoEstado || amb.estado === e} className="btn"
                style={{ background: amb.estado === e ? estadoColor[e] : "transparent", color: amb.estado === e ? "#fff" : estadoColor[e], border: `2px solid ${estadoColor[e]}`, fontWeight: amb.estado === e ? 700 : 500, opacity: cambiandoEstado ? 0.6 : 1, fontSize: "0.82rem", padding: "6px 16px" }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Datos */}
        <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Identificación</h3>
            <div className="grid-2" style={{ gap: 20 }}>
              <InfoField label="Placa" value={amb.placa} />
              <InfoField label="Tipo" value={amb.tipoAmbulancia} />
              <InfoField label="Marca" value={amb.marca} />
              <InfoField label="Modelo" value={amb.modelo} />
              <InfoField label="Año" value={amb.anio} />
              <InfoField label="GPS ID" value={amb.gpsId} />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Equipamiento</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <InfoField label="Dotación Base Asignada" value={amb.dotacionBaseAsignada} />
              <InfoField label="Capacidad de Oxígeno" value={amb.capacidadOxigeno} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
