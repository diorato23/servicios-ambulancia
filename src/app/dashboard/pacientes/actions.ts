"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export interface PacienteData {
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

function buildPacienteData(formData: FormData): PacienteData {
  // Firestore NO acepta undefined — campos vacíos deben ser "" (string vacía)
  const get = (k: string) => (formData.get(k) as string)?.trim() || "";
  return {
    tipoDocumento: formData.get("tipo_documento") as string,
    numeroDocumento: (formData.get("numero_documento") as string).trim(),
    primerNombre: (formData.get("primer_nombre") as string).trim(),
    segundoNombre: get("segundo_nombre"),
    primerApellido: (formData.get("primer_apellido") as string).trim(),
    segundoApellido: get("segundo_apellido"),
    fechaNacimiento: formData.get("fecha_nacimiento") as string,
    sexo: formData.get("sexo") as string,
    telefono: get("telefono"),
    direccion: get("direccion"),
    municipio: get("municipio"),
    correo: get("correo"),
    tipoAfiliacion: get("tipo_afiliacion"),
    eps: get("eps"),
    contactoEmergencia: get("contacto_emergencia"),
    telefonoContacto: get("telefono_contacto"),
    alergias: get("alergias"),
    antecedentesClinicos: get("antecedentes_clinicos"),
  };
}

export async function verificarDocumentoDuplicado(
  tipoDocumento: string,
  numeroDocumento: string,
  excludeId?: string
): Promise<{ existe: boolean; nombre?: string }> {
  const q = query(
    collection(db, "pacientes"),
    where("tipoDocumento", "==", tipoDocumento),
    where("numeroDocumento", "==", numeroDocumento)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    if (d.id !== excludeId) {
      const data = d.data();
      return {
        existe: true,
        nombre: `${data.primerNombre} ${data.primerApellido}`,
      };
    }
  }
  return { existe: false };
}

export async function crearPaciente(
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  try {
    const data = buildPacienteData(formData);
    const dup = await verificarDocumentoDuplicado(
      data.tipoDocumento,
      data.numeroDocumento
    );
    if (dup.existe) {
      return {
        error: `Ya existe un paciente con ese documento: ${dup.nombre}. Verifique los datos o búsquelo en la lista.`,
      };
    }
    const docRef = await addDoc(collection(db, "pacientes"), {
      ...data,
      fechaRegistro: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al guardar: ${msg}` };
  }
}

export async function actualizarPaciente(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const data = buildPacienteData(formData);
    const dup = await verificarDocumentoDuplicado(
      data.tipoDocumento,
      data.numeroDocumento,
      id
    );
    if (dup.existe) {
      return {
        error: `Ya existe otro paciente con ese documento: ${dup.nombre}.`,
      };
    }
    await updateDoc(doc(db, "pacientes", id), {
      ...data,
      fechaActualizacion: serverTimestamp(),
    });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al actualizar: ${msg}` };
  }
}

export async function eliminarPaciente(id: string): Promise<{ error?: string }> {
  try {
    await deleteDoc(doc(db, "pacientes", id));
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al eliminar: ${msg}` };
  }
}
