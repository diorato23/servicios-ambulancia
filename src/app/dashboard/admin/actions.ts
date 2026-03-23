"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { UserRole } from "@/lib/roles";

export interface UsuarioData {
  uid: string;
  email: string;
  nombre: string;
  photoURL: string;
  rol: UserRole;
  creadoEn: string;
}

export async function listarUsuarios(): Promise<UsuarioData[]> {
  const q = query(collection(db, "usuarios"), orderBy("creadoEn", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UsuarioData));
}

export async function actualizarRol(
  uid: string,
  nuevoRol: UserRole
): Promise<{ success?: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "usuarios", uid), {
      rol: nuevoRol,
      rolActualizadoEn: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar rol: " + (error as Error).message };
  }
}
