"use client";

import { useState } from "react";
import { crearTripulante } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NuevoTripulantePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await crearTripulante(formData);
    if (result.error) { setError(result.error); setPending(false); }
    else router.push("/dashboard/tripulantes");
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/tripulantes" className="btn btn-outline" style={{ padding: "6px 12px" }}><ArrowLeft size={15} /></Link>
          <div>
            <div className="topbar-title">Nuevo Tripulante</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>Registrar personal médico u operativo</div>
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
                <label className="form-label">Tipo Documento <span className="required">*</span></label>
                <select name="tipo_documento" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="PA">Pasaporte (PA)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Número Documento <span className="required">*</span></label>
                <input name="numero_documento" className="form-input" placeholder="Ej: 1234567890" required />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre Completo <span className="required">*</span></label>
                <input name="nombre_completo" className="form-input" placeholder="Ej: Dr. Juan Carlos Pérez" required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input name="telefono" className="form-input" placeholder="Ej: 3001234567" />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input name="correo" type="email" className="form-input" placeholder="Ej: juan@example.com" />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Información Profesional</h3>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Rol / Cargo <span className="required">*</span></label>
                <select name="rol" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Médico">Médico</option>
                  <option value="Enfermero">Enfermero(a)</option>
                  <option value="Paramédico">Paramédico</option>
                  <option value="Técnico en emergencias">Técnico en Emergencias</option>
                  <option value="Conductor">Conductor de Ambulancia</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tarjeta Profesional</label>
                <input name="tarjeta_profesional" className="form-input" placeholder="Número de registro profesional" />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select name="estado" className="form-select" defaultValue="Activo">
                  <option value="Activo">✅ Activo</option>
                  <option value="Inactivo">⛔ Inactivo</option>
                  <option value="En servicio">🔵 En servicio</option>
                  <option value="De licencia">🟡 De licencia</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/dashboard/tripulantes" className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}>
              <Save size={15} /> {pending ? "Guardando..." : "Registrar Tripulante"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
