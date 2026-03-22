"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { actualizarTripulante } from "../../actions";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Tripulante {
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  rol: string;
  tarjetaProfesional: string;
  telefono: string;
  correo: string;
  estado: string;
}

export default function EditarTripulantePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [trip, setTrip] = useState<Tripulante | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function cargar() {
      const snap = await getDoc(doc(db, "tripulantes", id));
      if (snap.exists()) setTrip(snap.data() as Tripulante);
    }
    cargar();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await actualizarTripulante(id, formData);
    if (result.error) { setError(result.error); setPending(false); }
    else router.push(`/dashboard/tripulantes/${id}`);
  }

  if (!trip) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/dashboard/tripulantes/${id}`} className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">Editar Tripulante</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{trip.nombreCompleto}</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>⚠️ {error}</div>
          )}

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Datos Personales</h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Tipo Documento</label>
                <select name="tipo_documento" className="form-select" defaultValue={trip.tipoDocumento} required>
                  <option value="CC">CC</option><option value="CE">CE</option><option value="TI">TI</option><option value="PA">PA</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Número Documento</label><input name="numero_documento" className="form-input" defaultValue={trip.numeroDocumento} required /></div>
              <div className="form-group"><label className="form-label">Nombre Completo</label><input name="nombre_completo" className="form-input" defaultValue={trip.nombreCompleto} required /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Teléfono</label><input name="telefono" className="form-input" defaultValue={trip.telefono} /></div>
              <div className="form-group"><label className="form-label">Correo</label><input name="correo" type="email" className="form-input" defaultValue={trip.correo} /></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Información Profesional</h3>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select name="rol" className="form-select" defaultValue={trip.rol} required>
                  <option value="Médico">Médico</option><option value="Enfermero">Enfermero</option><option value="Paramédico">Paramédico</option><option value="Técnico en emergencias">Técnico en Emergencias</option><option value="Conductor">Conductor</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Tarjeta Profesional</label><input name="tarjeta_profesional" className="form-input" defaultValue={trip.tarjetaProfesional} /></div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select name="estado" className="form-select" defaultValue={trip.estado}>
                  <option value="Activo">Activo</option><option value="Inactivo">Inactivo</option><option value="En servicio">En servicio</option><option value="De licencia">De licencia</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href={`/dashboard/tripulantes/${id}`} className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}><Save size={15} /> {pending ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
