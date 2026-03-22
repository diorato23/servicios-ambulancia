"use client";

import { useActionState } from "react";
import { actualizarPaciente } from "../../actions";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Paciente {
  id_paciente: string;
  tipo_documento: string;
  numero_documento: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  fecha_nacimiento: string;
  sexo: string;
  telefono: string | null;
  direccion: string | null;
  municipio: string | null;
  correo: string | null;
  tipo_afiliacion: string | null;
  eps: string | null;
  contacto_emergencia: string | null;
  telefono_contacto: string | null;
  alergias: string | null;
  antecedentes_clinicos: string | null;
}

const initialState = { error: "" };

export default function FormularioEditarPaciente({ paciente }: { paciente: Paciente }) {
  const updateAction = actualizarPaciente.bind(null, paciente.id_paciente);
  const [state, formAction, pending] = useActionState(updateAction, initialState);

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/dashboard/pacientes/${paciente.id_paciente}`} className="btn btn-outline" style={{ padding: "6px 12px" }}>
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="topbar-title">Editar Paciente</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
              {paciente.tipo_documento} {paciente.numero_documento}
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <form action={formAction}>
          {state?.error && (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>
              ⚠️ {state.error}
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
                <select name="tipo_documento" className="form-select" defaultValue={paciente.tipo_documento} required>
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
                <input name="numero_documento" className="form-input" defaultValue={paciente.numero_documento} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Nacimiento <span className="required">*</span></label>
                <input name="fecha_nacimiento" type="date" className="form-input" defaultValue={paciente.fecha_nacimiento} required />
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Primer Nombre <span className="required">*</span></label>
                <input name="primer_nombre" className="form-input" defaultValue={paciente.primer_nombre} required />
              </div>
              <div className="form-group">
                <label className="form-label">Segundo Nombre</label>
                <input name="segundo_nombre" className="form-input" defaultValue={paciente.segundo_nombre || ""} />
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Primer Apellido <span className="required">*</span></label>
                <input name="primer_apellido" className="form-input" defaultValue={paciente.primer_apellido} required />
              </div>
              <div className="form-group">
                <label className="form-label">Segundo Apellido</label>
                <input name="segundo_apellido" className="form-input" defaultValue={paciente.segundo_apellido || ""} />
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Sexo <span className="required">*</span></label>
                <select name="sexo" className="form-select" defaultValue={paciente.sexo} required>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input name="telefono" className="form-input" defaultValue={paciente.telefono || ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input name="correo" type="email" className="form-input" defaultValue={paciente.correo || ""} />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Ubicación</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Municipio</label>
                <input name="municipio" className="form-input" defaultValue={paciente.municipio || ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input name="direccion" className="form-input" defaultValue={paciente.direccion || ""} />
              </div>
            </div>
          </div>

          {/* Información de salud */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Información de Salud</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Tipo de Afiliación</label>
                <select name="tipo_afiliacion" className="form-select" defaultValue={paciente.tipo_afiliacion || ""}>
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
                <input name="eps" className="form-input" defaultValue={paciente.eps || ""} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Alergias</label>
                <textarea name="alergias" className="form-textarea" defaultValue={paciente.alergias || ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Antecedentes Clínicos</label>
                <textarea name="antecedentes_clinicos" className="form-textarea" defaultValue={paciente.antecedentes_clinicos || ""} />
              </div>
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Contacto de Emergencia</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombre del Contacto</label>
                <input name="contacto_emergencia" className="form-input" defaultValue={paciente.contacto_emergencia || ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono del Contacto</label>
                <input name="telefono_contacto" className="form-input" defaultValue={paciente.telefono_contacto || ""} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href={`/dashboard/pacientes/${paciente.id_paciente}`} className="btn btn-outline">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={pending} style={{ opacity: pending ? 0.7 : 1 }}>
              <Save size={15} />
              {pending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
