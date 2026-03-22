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

export interface AmbulanciaData {
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

function buildAmbulanciaData(formData: FormData): AmbulanciaData {
  const get = (k: string) => (formData.get(k) as string)?.trim() || "";
  return {
    placa: get("placa").toUpperCase(),
    tipoAmbulancia: get("tipo_ambulancia"),
    marca: get("marca"),
    modelo: get("modelo"),
    anio: get("anio"),
    estado: get("estado") || "Disponible",
    dotacionBaseAsignada: get("dotacion_base_asignada"),
    capacidadOxigeno: get("capacidad_oxigeno"),
    gpsId: get("gps_id"),
  };
}

export async function verificarPlacaDuplicada(
  placa: string,
  excludeId?: string
): Promise<{ existe: boolean }> {
  const q = query(collection(db, "ambulancias"), where("placa", "==", placa.toUpperCase()));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    if (d.id !== excludeId) return { existe: true };
  }
  return { existe: false };
}

export async function crearAmbulancia(
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  try {
    const data = buildAmbulanciaData(formData);
    if (!data.placa) return { error: "La placa es obligatoria." };
    const dup = await verificarPlacaDuplicada(data.placa);
    if (dup.existe) return { error: `Ya existe una ambulancia con la placa ${data.placa}.` };
    const docRef = await addDoc(collection(db, "ambulancias"), {
      ...data,
      fechaRegistro: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al crear: ${msg}` };
  }
}

export async function actualizarAmbulancia(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const data = buildAmbulanciaData(formData);
    const dup = await verificarPlacaDuplicada(data.placa, id);
    if (dup.existe) return { error: `Ya existe otra ambulancia con la placa ${data.placa}.` };
    await updateDoc(doc(db, "ambulancias", id), {
      ...data,
      fechaActualizacion: serverTimestamp(),
    });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al actualizar: ${msg}` };
  }
}

export async function actualizarEstadoAmbulancia(
  id: string,
  nuevoEstado: string
): Promise<{ error?: string }> {
  try {
    await updateDoc(doc(db, "ambulancias", id), {
      estado: nuevoEstado,
      fechaActualizacion: serverTimestamp(),
    });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al cambiar estado: ${msg}` };
  }
}

export async function eliminarAmbulancia(id: string): Promise<{ error?: string }> {
  try {
    await deleteDoc(doc(db, "ambulancias", id));
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al eliminar: ${msg}` };
  }
}
