"use client";

import { db } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";

export interface SignosVitales {
  presionArterial: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  temperatura: string;
  saturacionO2: string;
  glucometria: string;
}

export interface HistoriaClinicaData {
  idOS: string;
  idPaciente: string;
  nombrePaciente: string;
  fechaHoraLlegadaEscena: string;
  fechaHoraAtencion: string;
  motivoConsulta: string;
  enfermedadActual: string;
  antecedentes: string;
  examenFisicoGeneral: string;
  signosVitales: SignosVitales;
  escalaGlasgow: number;
  glasgowOcular: number;
  glasgowVerbal: number;
  glasgowMotor: number;
  triage: string;
  diagnosticoPresuntivo: string;
  procedimientosRealizados: string;
  medicamentosAdministrados: string;
  notasEvolucion: string;
  firmaResponsable: string;
  fechaHoraCierre: string;
}

function buildHistoriaData(formData: FormData): HistoriaClinicaData {
  const get = (k: string) => (formData.get(k) as string)?.trim() || "";
  const getNum = (k: string) => parseInt(get(k)) || 0;

  const glasgowOcular = getNum("glasgow_ocular");
  const glasgowVerbal = getNum("glasgow_verbal");
  const glasgowMotor = getNum("glasgow_motor");

  return {
    idOS: get("id_os"),
    idPaciente: get("id_paciente"),
    nombrePaciente: get("nombre_paciente"),
    fechaHoraLlegadaEscena: get("fecha_hora_llegada"),
    fechaHoraAtencion: get("fecha_hora_atencion"),
    motivoConsulta: get("motivo_consulta"),
    enfermedadActual: get("enfermedad_actual"),
    antecedentes: get("antecedentes"),
    examenFisicoGeneral: get("examen_fisico"),
    signosVitales: {
      presionArterial: get("presion_arterial"),
      frecuenciaCardiaca: get("frecuencia_cardiaca"),
      frecuenciaRespiratoria: get("frecuencia_respiratoria"),
      temperatura: get("temperatura"),
      saturacionO2: get("saturacion_o2"),
      glucometria: get("glucometria"),
    },
    escalaGlasgow: glasgowOcular + glasgowVerbal + glasgowMotor,
    glasgowOcular,
    glasgowVerbal,
    glasgowMotor,
    triage: get("triage"),
    diagnosticoPresuntivo: get("diagnostico_presuntivo"),
    procedimientosRealizados: get("procedimientos_realizados"),
    medicamentosAdministrados: get("medicamentos_administrados"),
    notasEvolucion: get("notas_evolucion"),
    firmaResponsable: get("firma_responsable"),
    fechaHoraCierre: get("fecha_hora_cierre"),
  };
}

export async function crearHistoriaClinica(formData: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const data = buildHistoriaData(formData);
    if (!data.idPaciente) return { error: "Debe seleccionar un paciente." };
    if (!data.motivoConsulta) return { error: "El motivo de consulta es obligatorio." };
    const docRef = await addDoc(collection(db, "historias_clinicas"), {
      ...data,
      fechaRegistro: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (e: unknown) {
    return { error: `Error al crear: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function actualizarHistoriaClinica(id: string, formData: FormData): Promise<{ error?: string }> {
  try {
    const data = buildHistoriaData(formData);
    await updateDoc(doc(db, "historias_clinicas", id), {
      ...data,
      fechaActualizacion: serverTimestamp(),
    });
    return {};
  } catch (e: unknown) {
    return { error: `Error al actualizar: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function eliminarHistoriaClinica(id: string): Promise<{ error?: string }> {
  try {
    await deleteDoc(doc(db, "historias_clinicas", id));
    return {};
  } catch (e: unknown) {
    return { error: `Error al eliminar: ${e instanceof Error ? e.message : String(e)}` };
  }
}
