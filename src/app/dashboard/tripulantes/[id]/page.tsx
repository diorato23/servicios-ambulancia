"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, User, Phone, Mail, Shield } from "lucide-react";
import { eliminarTripulante } from "../actions";

interface Tripulante {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  rol: string;
  tarjetaProfesional: string;
  telefono: string;
  correo: string;
  estado: string;
}

const estadoColor: Record<string, string> = {
  Activo: "var(--success)",
  Inactivo: "var(--danger)",
  "En servicio": "var(--primary)",
  "De licencia": "var(--warning)",
};

function InfoField({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>{icon}{label}</div>
      <div style={{ fontSize: "0.9rem", color: value ? "var(--foreground)" : "var(--muted)" }}>{value || "—"}</div>
    </div>
  );
}

export default function DetalleTripulantePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [trip, setTrip] = useState<Tripulante | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "tripulantes", id), (snap) => {
      if (snap.exists()) setTrip({ id: snap.id, ...snap.data() } as Tripulante);
    });
    return () => unsub();
  }, [id]);

  async function handleEliminar() {
    if (!confirm("¿Eliminar este tripulante?")) return;
    setEliminando(true);
    const result = await eliminarTripulante(id);
    if (result.error) { alert(result.error); setEliminando(false); }
    else router.push("/dashboard/tripulantes");
  }

  if (!trip) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/tripulantes" className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">{trip.nombreCompleto}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{trip.rol}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleEliminar} disabled={eliminando} className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
          <Link href={`/dashboard/tripulantes/${id}/editar`} className="btn btn-primary"><Edit size={15} /> Editar</Link>
        </div>
      </div>

      <div className="page-content">
        {/* Estado */}
        <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: estadoColor[trip.estado] || "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.2rem" }}>
            {trip.nombreCompleto?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{trip.nombreCompleto}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <span className={`badge ${trip.rol === "Médico" ? "badge-blue" : trip.rol === "Enfermero" ? "badge-green" : "badge-purple"}`}>{trip.rol}</span>
              <span className="badge" style={{ background: estadoColor[trip.estado] ? `${estadoColor[trip.estado]}20` : "var(--muted-light)", color: estadoColor[trip.estado] || "var(--muted)" }}>{trip.estado}</span>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Datos Personales</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <InfoField label="Documento" value={`${trip.tipoDocumento} ${trip.numeroDocumento}`} icon={<User size={12} />} />
              <InfoField label="Teléfono" value={trip.telefono} icon={<Phone size={12} />} />
              <InfoField label="Correo" value={trip.correo} icon={<Mail size={12} />} />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Información Profesional</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <InfoField label="Rol" value={trip.rol} icon={<Shield size={12} />} />
              <InfoField label="Tarjeta Profesional" value={trip.tarjetaProfesional} />
              <InfoField label="Estado" value={trip.estado} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
