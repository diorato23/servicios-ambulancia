"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { actualizarAmbulancia } from "../../actions";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Ambulancia {
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

export default function EditarAmbulanciaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [amb, setAmb] = useState<Ambulancia | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function cargar() {
      const snap = await getDoc(doc(db, "ambulancias", id));
      if (snap.exists()) setAmb(snap.data() as Ambulancia);
    }
    cargar();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await actualizarAmbulancia(id, formData);
    if (result.error) { setError(result.error); setPending(false); }
    else router.push(`/dashboard/ambulancias/${id}`);
  }

  if (!amb) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/dashboard/ambulancias/${id}`} className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">Editar Ambulancia</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{amb.placa}</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>⚠️ {error}</div>
          )}

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Identificación del Vehículo</h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Placa</label><input name="placa" className="form-input" defaultValue={amb.placa} required style={{ textTransform: "uppercase" }} /></div>
              <div className="form-group">
                <label className="form-label">Tipo de Ambulancia</label>
                <select name="tipo_ambulancia" className="form-select" defaultValue={amb.tipoAmbulancia} required>
                  <option value="TAB">TAB — Básico</option><option value="TAM">TAM — Medicalizado</option><option value="TAM-UCI">TAM-UCI — UCI</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select name="estado" className="form-select" defaultValue={amb.estado}>
                  <option value="Disponible">Disponible</option><option value="En servicio">En servicio</option><option value="En mantenimiento">En mantenimiento</option><option value="Fuera de servicio">Fuera de servicio</option>
                </select>
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Marca</label><input name="marca" className="form-input" defaultValue={amb.marca} required /></div>
              <div className="form-group"><label className="form-label">Modelo</label><input name="modelo" className="form-input" defaultValue={amb.modelo} /></div>
              <div className="form-group"><label className="form-label">Año</label><input name="anio" type="number" className="form-input" defaultValue={amb.anio} min="2000" max="2030" /></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Equipamiento y Rastreo</h3>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Dotación Base</label><textarea name="dotacion_base_asignada" className="form-textarea" defaultValue={amb.dotacionBaseAsignada} style={{ minHeight: 60 }} /></div>
              <div className="form-group"><label className="form-label">Capacidad de Oxígeno</label><input name="capacidad_oxigeno" className="form-input" defaultValue={amb.capacidadOxigeno} /></div>
              <div className="form-group"><label className="form-label">ID GPS</label><input name="gps_id" className="form-input" defaultValue={amb.gpsId} /></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href={`/dashboard/ambulancias/${id}`} className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}><Save size={15} /> {pending ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
