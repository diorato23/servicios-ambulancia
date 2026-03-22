"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export interface OrdenServicioData {
  fechaHoraSolicitud: string;
  canalSolicitud: string;
  nombreSolicitante: string;
  telefonoSolicitante: string;
  direccionOrigen: string;
  coordenadasOrigen: string;
  direccionDestino: string;
  coordenadasDestino: string;
  tipoServicio: string;
  tipoAmbulancia: string;
  prioridad: string;
  motivoSolicitud: string;
  idPaciente: string;
  nombrePaciente: string;
  estadoOS: string;
}

function buildOrdenData(formData: FormData): OrdenServicioData {
  const get = (k: string) => (formData.get(k) as string)?.trim() || "";
  return {
    fechaHoraSolicitud: get("fecha_hora_solicitud") || new Date().toISOString(),
    canalSolicitud: get("canal_solicitud"),
    nombreSolicitante: get("nombre_solicitante"),
    telefonoSolicitante: get("telefono_solicitante"),
    direccionOrigen: get("direccion_origen"),
    coordenadasOrigen: get("coordenadas_origen"),
    direccionDestino: get("direccion_destino"),
    coordenadasDestino: get("coordenadas_destino"),
    tipoServicio: get("tipo_servicio"),
    tipoAmbulancia: get("tipo_ambulancia"),
    prioridad: get("prioridad"),
    motivoSolicitud: get("motivo_solicitud"),
    idPaciente: get("id_paciente"),
    nombrePaciente: get("nombre_paciente"),
    estadoOS: get("estado_os") || "Pendiente",
  };
}

export async function crearOrden(
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  try {
    const data = buildOrdenData(formData);
    if (!data.idPaciente) {
      return { error: "Debe seleccionar un paciente para la orden." };
    }
    const newRef = doc(collection(db, "ordenes_servicio"));
    setDoc(newRef, { ...data, fechaRegistro: serverTimestamp() });
    return { id: newRef.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al crear la orden: ${msg}` };
  }
}

export async function actualizarOrden(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const data = buildOrdenData(formData);
    updateDoc(doc(db, "ordenes_servicio", id), { ...data, fechaActualizacion: serverTimestamp() });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al actualizar: ${msg}` };
  }
}

export async function actualizarEstadoOrden(
  id: string,
  nuevoEstado: string
): Promise<{ error?: string }> {
  try {
    updateDoc(doc(db, "ordenes_servicio", id), {
      estadoOS: nuevoEstado,
      fechaActualizacion: serverTimestamp(),
    });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al cambiar estado: ${msg}` };
  }
}

export async function eliminarOrden(id: string): Promise<{ error?: string }> {
  try {
    deleteDoc(doc(db, "ordenes_servicio", id));
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Error al eliminar: ${msg}` };
  }
}
