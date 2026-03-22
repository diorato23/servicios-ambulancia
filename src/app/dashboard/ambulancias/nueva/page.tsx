"use client";

import { useState } from "react";
import { crearAmbulancia } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NuevaAmbulanciaPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await crearAmbulancia(formData);
    if (result.error) { setError(result.error); setPending(false); }
    else router.push("/dashboard/ambulancias");
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/ambulancias" className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">Nueva Ambulancia</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>Registrar vehículo a la flota</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>⚠️ {error}</div>
          )}

          {/* Identificación */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Identificación del Vehículo</h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Placa <span className="required">*</span></label>
                <input name="placa" className="form-input" placeholder="Ej: ABC123" required style={{ textTransform: "uppercase" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Ambulancia <span className="required">*</span></label>
                <select name="tipo_ambulancia" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="TAB">TAB — Transporte Asistencial Básico</option>
                  <option value="TAM">TAM — Transporte Asistencial Medicalizado</option>
                  <option value="TAM-UCI">TAM-UCI — Cuidados Intensivos</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estado Inicial</label>
                <select name="estado" className="form-select" defaultValue="Disponible">
                  <option value="Disponible">✅ Disponible</option>
                  <option value="En servicio">🔵 En servicio</option>
                  <option value="En mantenimiento">🟡 En mantenimiento</option>
                  <option value="Fuera de servicio">🔴 Fuera de servicio</option>
                </select>
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Marca <span className="required">*</span></label>
                <input name="marca" className="form-input" placeholder="Ej: Toyota, Mercedes" required />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo</label>
                <input name="modelo" className="form-input" placeholder="Ej: HiAce, Sprinter" />
              </div>
              <div className="form-group">
                <label className="form-label">Año</label>
                <input name="anio" type="number" className="form-input" placeholder="Ej: 2023" min="2000" max="2030" />
              </div>
            </div>
          </div>

          {/* Equipamiento */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Equipamiento y Rastreo</h3>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Dotación Base Asignada</label>
                <textarea name="dotacion_base_asignada" className="form-textarea" placeholder="Equipo médico base asignado..." style={{ minHeight: 60 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Capacidad de Oxígeno</label>
                <input name="capacidad_oxigeno" className="form-input" placeholder="Ej: 2 cilindros de 3L" />
              </div>
              <div className="form-group">
                <label className="form-label">ID GPS / Rastreador</label>
                <input name="gps_id" className="form-input" placeholder="Ej: GPS-AMB-001" />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/dashboard/ambulancias" className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}>
              <Save size={15} /> {pending ? "Guardando..." : "Registrar Ambulancia"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
