"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, UserCheck, Stethoscope, Truck } from "lucide-react";
import { useUserRole } from "@/lib/useUserRole";
import { UserRole, rolLabels, rolColors } from "@/lib/roles";
import { listarUsuarios, actualizarRol, UsuarioData } from "../actions";

const rolIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  medico: Stethoscope,
  conductor: Truck,
};

export default function GestionUsuariosPage() {
  const router = useRouter();
  const { rol, loading: rolLoading } = useUserRole();
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (rolLoading) return;
    if (rol !== "admin") {
      router.push("/dashboard");
      return;
    }
    cargarUsuarios();
  }, [rol, rolLoading, router]);

  async function cargarUsuarios() {
    setLoading(true);
    const data = await listarUsuarios();
    setUsuarios(data);
    setLoading(false);
  }

  async function handleCambiarRol(uid: string, nuevoRol: UserRole) {
    if (!confirm(`¿Cambiar el rol de este usuario a "${rolLabels[nuevoRol]}"?`)) return;
    setUpdating(uid);
    const result = await actualizarRol(uid, nuevoRol);
    if (result.error) alert(result.error);
    else await cargarUsuarios();
    setUpdating(null);
  }

  if (rolLoading || loading) {
    return (
      <div className="page-content" style={{ textAlign: "center", paddingTop: 60, color: "var(--muted)" }}>
        Cargando...
      </div>
    );
  }

  if (rol !== "admin") return null;

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" className="btn btn-outline" style={{ padding: "6px 12px" }}>
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="topbar-title">Gestión de Usuarios</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
              Control de acceso y roles del sistema
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Leyenda de roles */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            Roles del Sistema
          </h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["admin", "medico", "conductor"] as UserRole[]).map((r) => {
              const Icon = rolIcons[r];
              return (
                <div
                  key={r}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: rolColors[r].bg,
                    border: `1px solid ${rolColors[r].text}22`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Icon size={16} color={rolColors[r].text} />
                    <strong style={{ color: rolColors[r].text, fontSize: "0.85rem" }}>{rolLabels[r]}</strong>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: rolColors[r].text, opacity: 0.8, lineHeight: 1.4 }}>
                    {r === "admin" && "Acceso total + gestión de usuarios"}
                    {r === "medico" && "Pacientes, HC, signos vitales, notas aclaratorias"}
                    {r === "conductor" && "Solo órdenes de servicio y ambulancias"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            Usuarios Registrados ({usuarios.length})
          </h3>

          {usuarios.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No hay usuarios registrados</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>USUARIO</th>
                    <th>EMAIL</th>
                    <th>ROL ACTUAL</th>
                    <th>CAMBIAR ROL</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => {
                    const Icon = rolIcons[u.rol] || UserCheck;
                    return (
                      <tr key={u.uid}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: rolColors[u.rol]?.bg || "#eee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              overflow: "hidden",
                            }}>
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                              ) : (
                                <span style={{ fontWeight: 700, fontSize: "0.8rem", color: rolColors[u.rol]?.text || "#666" }}>
                                  {(u.nombre || u.email || "U").charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                              {u.nombre || "Sin nombre"}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{u.email}</td>
                        <td>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 12,
                            background: rolColors[u.rol]?.bg || "#eee",
                            color: rolColors[u.rol]?.text || "#666",
                          }}>
                            <Icon size={12} />
                            {rolLabels[u.rol] || u.rol}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            {(["admin", "medico", "conductor"] as UserRole[])
                              .filter((r) => r !== u.rol)
                              .map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleCambiarRol(u.uid, r)}
                                  disabled={updating === u.uid}
                                  className="btn btn-outline"
                                  style={{
                                    padding: "4px 10px",
                                    fontSize: "0.72rem",
                                    opacity: updating === u.uid ? 0.5 : 1,
                                    color: rolColors[r].text,
                                    borderColor: `${rolColors[r].text}44`,
                                  }}
                                >
                                  {rolLabels[r]}
                                </button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
