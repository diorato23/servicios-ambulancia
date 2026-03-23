"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  setDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// ============================================================
// TIPOS
// ============================================================

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

// ============================================================
// HELPERS
// ============================================================

function buildPacienteData(formData: FormData): PacienteData {
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

/** Verifica si ya existe un paciente con el mismo tipo + número de documento */
async function verificarDocumentoDuplicado(
  tipoDocumento: string,
  numeroDocumento: string,
  excludeId?: string
): Promise<{ existe: boolean; nombre?: string }> {
  try {
    const q = query(
      collection(db, "pacientes"),
      where("tipoDocumento", "==", tipoDocumento),
      where("numeroDocumento", "==", numeroDocumento)
    );
    const snapPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 3000)
    );
    const result = await Promise.race([snapPromise, timeoutPromise]);
    if (!result) return { existe: false }; // offline timeout
    for (const d of result.docs) {
      if (d.id !== excludeId) {
        const data = d.data();
        return {
          existe: true,
          nombre: `${data.primerNombre} ${data.primerApellido}`,
        };
      }
    }
    return { existe: false };
  } catch {
    return { existe: false };
  }
}

// ============================================================
// CREAR PACIENTE
// ============================================================

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
        error: `Ya existe un paciente con ese documento: ${dup.nombre}.`,
      };
    }
    const newRef = doc(collection(db, "pacientes"));
    await setDoc(newRef, {
      ...data,
      activo: true, // paciente ativo por padrão
      fechaRegistro: serverTimestamp(),
    });
    return { id: newRef.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al guardar: ${msg}` };
  }
}

// ============================================================
// ACTUALIZAR PACIENTE (com auditoria)
// ============================================================

/**
 * Atualiza dados do paciente e registra as mudanças na coleção de auditoria.
 * Tipo e número de documento NÃO podem ser alterados.
 */
export async function actualizarPaciente(
  id: string,
  formData: FormData,
  datosAnterior: PacienteData,
  usuario: string
): Promise<{ error?: string }> {
  try {
    const data = buildPacienteData(formData);

    // Impedir alteração do documento de identidade
    if (
      data.tipoDocumento !== datosAnterior.tipoDocumento ||
      data.numeroDocumento !== datosAnterior.numeroDocumento
    ) {
      return {
        error:
          "No se puede modificar el tipo ni el número de documento. Contacte al administrador.",
      };
    }

    // Registrar mudanças na auditoria
    const cambios: Array<{
      campo: string;
      anterior: string;
      nuevo: string;
    }> = [];

    const camposAuditar: Array<{ campo: keyof PacienteData; label: string }> = [
      { campo: "primerNombre", label: "Primer Nombre" },
      { campo: "segundoNombre", label: "Segundo Nombre" },
      { campo: "primerApellido", label: "Primer Apellido" },
      { campo: "segundoApellido", label: "Segundo Apellido" },
      { campo: "fechaNacimiento", label: "Fecha de Nacimiento" },
      { campo: "sexo", label: "Sexo" },
      { campo: "telefono", label: "Teléfono" },
      { campo: "direccion", label: "Dirección" },
      { campo: "municipio", label: "Municipio" },
      { campo: "correo", label: "Correo" },
      { campo: "tipoAfiliacion", label: "Tipo de Afiliación" },
      { campo: "eps", label: "EPS" },
      { campo: "contactoEmergencia", label: "Contacto de Emergencia" },
      { campo: "telefonoContacto", label: "Teléfono de Contacto" },
      { campo: "alergias", label: "Alergias" },
      { campo: "antecedentesClinicos", label: "Antecedentes Clínicos" },
    ];

    for (const { campo, label } of camposAuditar) {
      const anterior = (datosAnterior[campo] as string) || "";
      const nuevo = (data[campo] as string) || "";
      if (anterior !== nuevo) {
        cambios.push({ campo: label, anterior, nuevo });
      }
    }

    // Gravar auditoria se houve mudanças
    if (cambios.length > 0) {
      for (const cambio of cambios) {
        const auditRef = doc(collection(db, "paciente_auditoria"));
        await setDoc(auditRef, {
          idPaciente: id,
          campoModificado: cambio.campo,
          valorAnterior: cambio.anterior,
          valorNuevo: cambio.nuevo,
          usuario,
          fechaModificacion: serverTimestamp(),
        });
      }
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

// ============================================================
// DESACTIVAR PACIENTE (soft-delete)
// ============================================================

/**
 * Desactiva un paciente (soft-delete).
 * Los datos y el historial clínico se mantienen intactos.
 * El paciente ya no aparece en las listas activas.
 * NUNCA se elimina un paciente — Resolución 1995/99.
 */
export async function desactivarPaciente(
  id: string,
  usuario: string
): Promise<{ error?: string }> {
  try {
    await updateDoc(doc(db, "pacientes", id), {
      activo: false,
      fechaDesactivacion: serverTimestamp(),
    });

    // Registrar na auditoria
    const auditRef = doc(collection(db, "paciente_auditoria"));
    await setDoc(auditRef, {
      idPaciente: id,
      campoModificado: "Estado",
      valorAnterior: "Activo",
      valorNuevo: "Inactivo (desactivado)",
      usuario,
      fechaModificacion: serverTimestamp(),
    });

    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al desactivar: ${msg}` };
  }
}

/**
 * Reactiva un paciente previamente desactivado.
 */
export async function reactivarPaciente(
  id: string,
  usuario: string
): Promise<{ error?: string }> {
  try {
    await updateDoc(doc(db, "pacientes", id), {
      activo: true,
      fechaReactivacion: serverTimestamp(),
    });

    const auditRef = doc(collection(db, "paciente_auditoria"));
    await setDoc(auditRef, {
      idPaciente: id,
      campoModificado: "Estado",
      valorAnterior: "Inactivo",
      valorNuevo: "Activo (reactivado)",
      usuario,
      fechaModificacion: serverTimestamp(),
    });

    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al reactivar: ${msg}` };
  }
}

// ============================================================
// ❌ OPERACIÓN PROHIBIDA
// ============================================================
// eliminarPaciente() — ELIMINADA
//
// La eliminación de pacientes está prohibida para preservar
// el historial clínico según la normativa colombiana.
// Use desactivarPaciente() en su lugar.
// ============================================================
