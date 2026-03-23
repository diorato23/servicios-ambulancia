"use client";

// Definição de roles do sistema
export type UserRole = "admin" | "medico" | "conductor";

// Recursos protegidos
export type Recurso =
  | "panel"
  | "pacientes"
  | "pacientes_detalle"
  | "ordenes"
  | "historias"
  | "historias_crear"
  | "ambulancias"
  | "tripulantes"
  | "admin_usuarios"
  | "notas_aclaratorias";

// Mapa de permissões por rol
const permisos: Record<UserRole, Recurso[]> = {
  admin: [
    "panel",
    "pacientes",
    "pacientes_detalle",
    "ordenes",
    "historias",
    "historias_crear",
    "ambulancias",
    "tripulantes",
    "admin_usuarios",
    "notas_aclaratorias",
  ],
  medico: [
    "panel",
    "pacientes",
    "pacientes_detalle",
    "ordenes",
    "historias",
    "historias_crear",
    "ambulancias",
    "tripulantes",
    "notas_aclaratorias",
  ],
  conductor: [
    "panel",
    "ordenes",
    "ambulancias",
  ],
};

// Verificar se um rol tem acesso a um recurso
export function canAccess(rol: UserRole | null, recurso: Recurso): boolean {
  if (!rol) return false;
  return permisos[rol].includes(recurso);
}

// Labels legíveis para os roles
export const rolLabels: Record<UserRole, string> = {
  admin: "Administrador",
  medico: "Médico / TPH",
  conductor: "Conductor",
};

// Cores dos badges de rol
export const rolColors: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: "#fef3c7", text: "#92400e" },
  medico: { bg: "#dbeafe", text: "#1e40af" },
  conductor: { bg: "#d1fae5", text: "#065f46" },
};
