"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserRole } from "@/lib/roles";

interface UseUserRoleReturn {
  user: User | null;
  rol: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isMedico: boolean;
  isConductor: boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const [user, setUser] = useState<User | null>(null);
  const [rol, setRol] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));
          if (userDoc.exists()) {
            setRol(userDoc.data().rol as UserRole);
          } else {
            // Primeiro login — registrar como admin (primeiro usuário)
            // ou medico (usuários subsequentes)
            const defaultRol: UserRole = "medico";
            await setDoc(doc(db, "usuarios", firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              nombre: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || "",
              rol: defaultRol,
              creadoEn: new Date().toISOString(),
            });
            setRol(defaultRol);
          }
        } catch (error) {
          console.error("Error al obtener rol del usuario:", error);
          setRol("conductor"); // fallback mais restritivo
        }
      } else {
        setRol(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    rol,
    loading,
    isAdmin: rol === "admin",
    isMedico: rol === "medico",
    isConductor: rol === "conductor",
  };
}
