"use client";

import { useState } from "react";
import { crearPaciente } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NuevoPacientePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await crearPaciente(formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push("/dashboard/pacientes");
    }
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/pacientes" className="btn btn-outline" style={{ padding: "6px 12px" }}>
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="topbar-title">Nuevo Paciente</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
              Registro de nuevo paciente en el sistema
            </div>
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

          {/* Datos personales */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              Datos Personales
            </h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Tipo de Documento <span className="required">*</span></label>
                <select name="tipo_documento" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="RC">Registro Civil (RC)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PA">Pasaporte (PA)</option>
                  <option value="PE">Permiso Especial de Permanencia (PE)</option>
                  <option value="NIT">NIT</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Número de Documento <span className="required">*</span></label>
                <input name="numero_documento" className="form-input" placeholder="Ej: 1234567890" required />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Nacimiento <span className="required">*</span></label>
                <input name="fecha_nacimiento" type="date" className="form-input" required />
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Primer Nombre <span className="required">*</span></label>
                <input name="primer_nombre" className="form-input" placeholder="Ej: Juan" required />
              </div>
              <div className="form-group">
                <label className="form-label">Segundo Nombre</label>
                <input name="segundo_nombre" className="form-input" placeholder="Opcional" />
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Primer Apellido <span className="required">*</span></label>
                <input name="primer_apellido" className="form-input" placeholder="Ej: García" required />
              </div>
              <div className="form-group">
                <label className="form-label">Segundo Apellido</label>
                <input name="segundo_apellido" className="form-input" placeholder="Opcional" />
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Sexo <span className="required">*</span></label>
                <select name="sexo" className="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input name="telefono" className="form-input" placeholder="Ej: 3001234567" />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input name="correo" type="email" className="form-input" placeholder="correo@ejemplo.com" />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Ubicación</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Municipio</label>
                <input name="municipio" className="form-input" placeholder="Ej: Medellín" />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input name="direccion" className="form-input" placeholder="Ej: Calle 50 # 38-25" />
              </div>
            </div>
          </div>

          {/* Información médica */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Información de Salud</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Tipo de Afiliación</label>
                <select name="tipo_afiliacion" className="form-select">
                  <option value="">Seleccionar...</option>
                  <option value="Contributivo">Contributivo</option>
                  <option value="Subsidiado">Subsidiado</option>
                  <option value="Vinculado">Vinculado</option>
                  <option value="Particular">Particular</option>
                  <option value="Especial">Especial</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">EPS</label>
                <select name="eps" className="form-select">
                  <option value="">Seleccionar...</option>
                  <option value="Nueva EPS">Nueva EPS</option>
                  <option value="Sanitas">Sanitas</option>
                  <option value="Sura">Sura</option>
                  <option value="Salud Total">Salud Total</option>
                  <option value="Compensar">Compensar</option>
                  <option value="Famisanar">Famisanar</option>
                  <option value="Coosalud">Coosalud</option>
                  <option value="Mutual Ser">Mutual Ser</option>
                  <option value="Comfenalco">Comfenalco</option>
                  <option value="Coomeva">Coomeva</option>
                  <option value="Cafesalud">Cafesalud</option>
                  <option value="Capital Salud">Capital Salud</option>
                  <option value="Medimás">Medimás</option>
                  <option value="Aliansalud">Aliansalud</option>
                  <option value="SOS">SOS</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Alergias</label>
                <textarea name="alergias" className="form-textarea" placeholder="Alergias conocidas..." style={{ minHeight: 80 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Antecedentes Clínicos</label>
                <textarea name="antecedentes_clinicos" className="form-textarea" placeholder="Enfermedades previas, cirugías, medicamentos..." style={{ minHeight: 80 }} />
              </div>
            </div>
          </div>

          {/* Contacto emergencia */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Contacto de Emergencia</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombre del Contacto</label>
                <input name="contacto_emergencia" className="form-input" placeholder="Nombre completo" />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono del Contacto</label>
                <input name="telefono_contacto" className="form-input" placeholder="Ej: 3009876543" />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/dashboard/pacientes" className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}>
              <Save size={15} />
              {pending ? "Guardando..." : "Guardar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
