"use client";

import { db } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp,
} from "firebase/firestore";

export interface TripulanteData {
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  rol: string;
  tarjetaProfesional: string;
  telefono: string;
  correo: string;
  estado: string;
}

function buildTripulanteData(formData: FormData): TripulanteData {
  const get = (k: string) => (formData.get(k) as string)?.trim() || "";
  return {
    tipoDocumento: get("tipo_documento"),
    numeroDocumento: get("numero_documento"),
    nombreCompleto: get("nombre_completo"),
    rol: get("rol"),
    tarjetaProfesional: get("tarjeta_profesional"),
    telefono: get("telefono"),
    correo: get("correo"),
    estado: get("estado") || "Activo",
  };
}

export async function verificarDocumentoDuplicadoTripulante(
  tipoDoc: string, numDoc: string, excludeId?: string
): Promise<{ existe: boolean; nombre?: string }> {
  const q = query(collection(db, "tripulantes"), where("tipoDocumento", "==", tipoDoc), where("numeroDocumento", "==", numDoc));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    if (d.id !== excludeId) return { existe: true, nombre: d.data().nombreCompleto };
  }
  return { existe: false };
}

export async function crearTripulante(formData: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const data = buildTripulanteData(formData);
    if (!data.nombreCompleto) return { error: "El nombre es obligatorio." };
    const dup = await verificarDocumentoDuplicadoTripulante(data.tipoDocumento, data.numeroDocumento);
    if (dup.existe) return { error: `Ya existe un tripulante con ese documento: ${dup.nombre}.` };
    const docRef = await addDoc(collection(db, "tripulantes"), { ...data, fechaRegistro: serverTimestamp() });
    return { id: docRef.id };
  } catch (e: unknown) {
    return { error: `Error al crear: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function actualizarTripulante(id: string, formData: FormData): Promise<{ error?: string }> {
  try {
    const data = buildTripulanteData(formData);
    const dup = await verificarDocumentoDuplicadoTripulante(data.tipoDocumento, data.numeroDocumento, id);
    if (dup.existe) return { error: `Ya existe otro tripulante con ese documento: ${dup.nombre}.` };
    await updateDoc(doc(db, "tripulantes", id), { ...data, fechaActualizacion: serverTimestamp() });
    return {};
  } catch (e: unknown) {
    return { error: `Error al actualizar: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function eliminarTripulante(id: string): Promise<{ error?: string }> {
  try {
    await deleteDoc(doc(db, "tripulantes", id));
    return {};
  } catch (e: unknown) {
    return { error: `Error al eliminar: ${e instanceof Error ? e.message : String(e)}` };
  }
}
