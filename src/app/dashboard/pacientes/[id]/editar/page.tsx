"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { actualizarPaciente } from "../../actions";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Paciente {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaNacimiento: string;
  sexo: string;
  telefono?: string;
  direccion?: string;
  municipio?: string;
  correo?: string;
  tipoAfiliacion?: string;
  eps?: string;
  contactoEmergencia?: string;
  telefonoContacto?: string;
  alergias?: string;
  antecedentesClinicos?: string;
}

export default function EditarPacientePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "pacientes", id)).then((snap) => {
      if (snap.exists()) setPaciente({ id: snap.id, ...snap.data() } as Paciente);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await actualizarPaciente(id, formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push(`/dashboard/pacientes/${id}`);
    }
  }

  if (!paciente) return <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>Cargando...</div>;

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/dashboard/pacientes/${id}`} className="btn btn-outline" style={{ padding: "6px 12px" }}>
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="topbar-title">Editar Paciente</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{paciente.tipoDocumento} {paciente.numeroDocumento}</div>
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

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Datos Personales</h3>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Tipo de Documento <span className="required">*</span></label>
                <select name="tipo_documento" className="form-select" defaultValue={paciente.tipoDocumento} required>
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
                <input name="numero_documento" className="form-input" defaultValue={paciente.numeroDocumento} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Nacimiento <span className="required">*</span></label>
                <input name="fecha_nacimiento" type="date" className="form-input" defaultValue={paciente.fechaNacimiento} required />
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Primer Nombre <span className="required">*</span></label><input name="primer_nombre" className="form-input" defaultValue={paciente.primerNombre} required /></div>
              <div className="form-group"><label className="form-label">Segundo Nombre</label><input name="segundo_nombre" className="form-input" defaultValue={paciente.segundoNombre || ""} /></div>
            </div>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">Primer Apellido <span className="required">*</span></label><input name="primer_apellido" className="form-input" defaultValue={paciente.primerApellido} required /></div>
              <div className="form-group"><label className="form-label">Segundo Apellido</label><input name="segundo_apellido" className="form-input" defaultValue={paciente.segundoApellido || ""} /></div>
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
              <div className="form-group"><label className="form-label">Teléfono</label><input name="telefono" className="form-input" defaultValue={paciente.telefono || ""} /></div>
              <div className="form-group"><label className="form-label">Correo</label><input name="correo" type="email" className="form-input" defaultValue={paciente.correo || ""} /></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Ubicación</h3>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Municipio</label><input name="municipio" className="form-input" defaultValue={paciente.municipio || ""} /></div>
              <div className="form-group"><label className="form-label">Dirección</label><input name="direccion" className="form-input" defaultValue={paciente.direccion || ""} /></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Información de Salud</h3>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Tipo de Afiliación</label>
                <select name="tipo_afiliacion" className="form-select" defaultValue={paciente.tipoAfiliacion || ""}>
                  <option value="">Seleccionar...</option>
                  <option value="Contributivo">Contributivo</option>
                  <option value="Subsidiado">Subsidiado</option>
                  <option value="Vinculado">Vinculado</option>
                  <option value="Particular">Particular</option>
                  <option value="Especial">Especial</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">EPS</label><input name="eps" className="form-input" defaultValue={paciente.eps || ""} /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Alergias</label><textarea name="alergias" className="form-textarea" defaultValue={paciente.alergias || ""} /></div>
              <div className="form-group"><label className="form-label">Antecedentes Clínicos</label><textarea name="antecedentes_clinicos" className="form-textarea" defaultValue={paciente.antecedentesClinicos || ""} /></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Contacto de Emergencia</h3>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Nombre</label><input name="contacto_emergencia" className="form-input" defaultValue={paciente.contactoEmergencia || ""} /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input name="telefono_contacto" className="form-input" defaultValue={paciente.telefonoContacto || ""} /></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href={`/dashboard/pacientes/${id}`} className="btn btn-outline">Cancelar</Link>
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
