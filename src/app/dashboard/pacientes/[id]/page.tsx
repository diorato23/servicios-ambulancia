"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where, getCountFromServer } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, FileText, ClipboardList } from "lucide-react";
import { desactivarPaciente } from "../actions";

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

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function InfoField({ label, value, danger }: { label: string; value?: string | null; danger?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{
        fontSize: "0.9rem",
        color: danger && value ? "var(--danger)" : value ? "var(--foreground)" : "var(--muted)",
        background: danger && value ? "var(--danger-light)" : "transparent",
        padding: danger && value ? "6px 10px" : 0,
        borderRadius: 6,
      }}>
        {value || "—"}
      </div>
    </div>
  );
}

export default function DetallePacientePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historias, setHistorias] = useState(0);
  const [ordenes, setOrdenes] = useState(0);
  const [desactivando, setDesactivando] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "pacientes", id), (snap) => {
      if (snap.exists()) {
        setPaciente({ id: snap.id, ...snap.data() } as Paciente);
      }
    });
    // Contar historias y ordenes
    async function contarRelaciones() {
      const [hSnap, oSnap] = await Promise.all([
        getCountFromServer(query(collection(db, "historias_clinicas"), where("idPaciente", "==", id))),
        getCountFromServer(query(collection(db, "ordenes_servicio"), where("idPaciente", "==", id))),
      ]);
      setHistorias(hSnap.data().count);
      setOrdenes(oSnap.data().count);
    }
    contarRelaciones();
    return () => unsub();
  }, [id]);

  async function handleDesactivar() {
    if (!confirm("¿Desactivar este paciente? Sus datos e historial clínico se conservarán, pero no aparecerá en las listas activas.")) return;
    setDesactivando(true);
    const result = await desactivarPaciente(id, "admin");
    if (result.error) {
      alert(result.error);
      setDesactivando(false);
    } else {
      router.push("/dashboard/pacientes");
    }
  }

  if (!paciente) {
    return (
      <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>
        Cargando...
      </div>
    );
  }

  const nombreCompleto = [paciente.primerNombre, paciente.segundoNombre, paciente.primerApellido, paciente.segundoApellido].filter(Boolean).join(" ");

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/pacientes" className="btn btn-outline" style={{ padding: "6px 12px" }}>
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="topbar-title">{nombreCompleto}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{paciente.tipoDocumento} {paciente.numeroDocumento}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleDesactivar} disabled={desactivando} className="btn btn-outline" style={{ color: "var(--warning)", borderColor: "var(--warning)" }}>
            {desactivando ? "Desactivando..." : "Desactivar"}
          </button>
          <Link href={`/dashboard/pacientes/${id}/editar`} className="btn btn-primary">
            <Edit size={15} /> Editar
          </Link>
        </div>
      </div>

      <div className="page-content">
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Edad</div>
            <div className="stat-value">{calcularEdad(paciente.fechaNacimiento)}</div>
            <div className="stat-sub">años</div>
          </div>
          <div className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div className="stat-label">Historias Clínicas</div><div className="stat-value">{historias}</div><div className="stat-sub">registradas</div></div>
              <FileText size={24} color="var(--primary)" style={{ opacity: 0.5 }} />
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div className="stat-label">Órdenes de Servicio</div><div className="stat-value">{ordenes}</div><div className="stat-sub">solicitadas</div></div>
              <ClipboardList size={24} color="var(--primary)" style={{ opacity: 0.5 }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Datos Personales</h3>
          <div className="grid-3" style={{ gap: 20 }}>
            <InfoField label="Tipo de Documento" value={paciente.tipoDocumento} />
            <InfoField label="Número de Documento" value={paciente.numeroDocumento} />
            <InfoField label="Fecha de Nacimiento" value={new Date(paciente.fechaNacimiento + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })} />
            <InfoField label="Sexo" value={paciente.sexo} />
            <InfoField label="Teléfono" value={paciente.telefono} />
            <InfoField label="Correo" value={paciente.correo} />
            <InfoField label="Municipio" value={paciente.municipio} />
            <InfoField label="Dirección" value={paciente.direccion} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Información de Salud</h3>
          <div className="grid-2" style={{ gap: 20, marginBottom: 16 }}>
            <InfoField label="Tipo de Afiliación" value={paciente.tipoAfiliacion} />
            <InfoField label="EPS" value={paciente.eps} />
          </div>
          <div className="grid-2" style={{ gap: 20 }}>
            <InfoField label="Alergias" value={paciente.alergias} danger />
            <InfoField label="Antecedentes Clínicos" value={paciente.antecedentesClinicos} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>Contacto de Emergencia</h3>
          <div className="grid-2" style={{ gap: 20 }}>
            <InfoField label="Nombre" value={paciente.contactoEmergencia} />
            <InfoField label="Teléfono" value={paciente.telefonoContacto} />
          </div>
        </div>
      </div>
    </>
  );
}
