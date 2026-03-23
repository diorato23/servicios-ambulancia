"use client";

import { db } from "@/lib/firebase";
import {
  collection, setDoc, doc, query, where, getDocs, orderBy, serverTimestamp,
} from "firebase/firestore";

// ============================================================
// TIPOS
// ============================================================

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

export interface NotaAclaratoriaData {
  idHC: string;
  motivo: string;
  campoCorregido: string;
  valorAnterior: string;
  valorCorregido: string;
  responsable: string;
  cargoResponsable: string;
}

// ============================================================
// HELPERS
// ============================================================

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

// ============================================================
// CREAR HISTORIA CLÍNICA (única operación permitida)
// ============================================================

/**
 * Crea una nueva historia clínica.
 * Una vez creada, NO puede ser modificada ni eliminada (Resolución 1995/99).
 * Las correcciones se hacen mediante Notas Aclaratorias.
 */
export async function crearHistoriaClinica(
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  try {
    const data = buildHistoriaData(formData);
    if (!data.idPaciente) return { error: "Debe seleccionar un paciente." };
    if (!data.motivoConsulta)
      return { error: "El motivo de consulta es obligatorio." };
    const newRef = doc(collection(db, "historias_clinicas"));
    await setDoc(newRef, {
      ...data,
      fechaRegistro: serverTimestamp(),
      // Metadatos de inmutabilidad
      _inmutable: true,
      _version: 1,
    });
    return { id: newRef.id };
  } catch (e: unknown) {
    return {
      error: `Error al crear: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ============================================================
// NOTAS ACLARATORIAS (correcciones legales — Res. 1995/99)
// ============================================================

/**
 * Crea una nota aclaratoria asociada a una historia clínica.
 * La nota también es inmutable una vez creada.
 * Solo los médicos pueden crear notas aclaratorias.
 */
export async function crearNotaAclaratoria(
  data: NotaAclaratoriaData
): Promise<{ error?: string; id?: string }> {
  try {
    if (!data.idHC) return { error: "Debe indicar la historia clínica." };
    if (!data.motivo)
      return { error: "El motivo de la corrección es obligatorio." };
    if (!data.campoCorregido)
      return { error: "Debe indicar el campo a corregir." };
    if (!data.responsable)
      return { error: "Debe indicar el médico responsable." };

    const newRef = doc(collection(db, "notas_aclaratorias"));
    await setDoc(newRef, {
      ...data,
      fechaCreacion: serverTimestamp(),
      _inmutable: true,
    });
    return { id: newRef.id };
  } catch (e: unknown) {
    return {
      error: `Error al crear nota: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

/**
 * Obtiene todas las notas aclaratorias de una historia clínica.
 */
export async function obtenerNotasAclaratorias(
  idHC: string
): Promise<{ notas: NotaAclaratoriaData[]; error?: string }> {
  try {
    const q = query(
      collection(db, "notas_aclaratorias"),
      where("idHC", "==", idHC),
      orderBy("fechaCreacion", "desc")
    );
    const snap = await getDocs(q);
    const notas = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as unknown as NotaAclaratoriaData[];
    return { notas };
  } catch (e: unknown) {
    return {
      notas: [],
      error: `Error al obtener notas: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ============================================================
// ❌ OPERACIONES PROHIBIDAS (Resolución 1995/99)
// ============================================================
// actualizarHistoriaClinica() — ELIMINADA
// eliminarHistoriaClinica() — ELIMINADA
//
// La modificación y eliminación de historias clínicas está
// prohibida por la normativa colombiana. Las correcciones
// se documentan mediante notas aclaratorias.
// ============================================================
