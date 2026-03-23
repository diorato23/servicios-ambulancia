"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Users,
  ClipboardList,
  Ambulance,
  UserCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const MOBILE_BREAKPOINT = 768;

const navItems = [
  {
    section: "Principal",
    links: [
      { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
    ],
  },
  {
    section: "Gestión Clínica",
    links: [
      { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
      { href: "/dashboard/ordenes", label: "Órdenes de Servicio", icon: ClipboardList },
      { href: "/dashboard/historias", label: "Historias Clínicas", icon: FileText },
    ],
  },
  {
    section: "Operaciones",
    links: [
      { href: "/dashboard/ambulancias", label: "Ambulancias", icon: Ambulance },
      { href: "/dashboard/tripulantes", label: "Tripulantes", icon: UserCheck },
    ],
  },
];

const mobileNavLinks = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/ordenes", label: "Órdenes", icon: ClipboardList },
  { href: "/dashboard/ambulancias", label: "Ambulancias", icon: Ambulance },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Escutar mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Detectar mobile por JS (mais confiável que CSS media queries com Turbopack)
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  // Fechar sidebar ao navegar (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Travar scroll quando sidebar mobile está aberto
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, sidebarOpen]);

  // --- Estilos inline controlados por JS ---
  const sidebarStyle: React.CSSProperties = {
    background: "var(--sidebar)",
    minHeight: "100vh",
    width: isMobile ? "280px" : "260px",
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
    // No mobile: esconder via transform; no desktop: sempre visível
    transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
    boxShadow: isMobile && sidebarOpen ? "4px 0 24px rgba(0,0,0,0.3)" : "none",
  };

  const mainStyle: React.CSSProperties = {
    marginLeft: isMobile ? 0 : "260px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    width: isMobile ? "100%" : "calc(100% - 260px)",
    paddingBottom: isMobile ? "72px" : 0,
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Overlay escuro — só mobile quando sidebar aberto */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
            zIndex: 99,
            cursor: "pointer",
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                background: "#1e40af",
                borderRadius: 8,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Ambulance size={18} color="#fff" />
              </div>
              <div>
                <h1 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700 }}>Ambulancias</h1>
                <p style={{ color: "var(--sidebar-text)", fontSize: "0.72rem", marginTop: 1 }}>Sistema de Gestión CRM</p>
              </div>
            </div>

            {/* Botão fechar — só aparece no mobile */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Fechar menu"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <p className="sidebar-section-label">{section.section}</p>
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    <Icon size={17} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Perfil do usuário */}
          {currentUser && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px 10px",
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                flexShrink: 0,
                overflow: "hidden",
              }}>
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  (currentUser.displayName || currentUser.email || "U")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <p style={{
                  color: "#fff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {currentUser.displayName || "Usuario"}
                </p>
                <p style={{
                  color: "var(--sidebar-text)",
                  fontSize: "0.68rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: 1,
                }}>
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}

          {/* Botão Cerrar Sesión */}
          <div style={{ padding: "4px 12px 12px" }}>
            <button
              className="sidebar-link"
              style={{ width: "100%", background: "none", border: "none" }}
              disabled={loggingOut}
              onClick={async () => {
                setLoggingOut(true);
                try {
                  await signOut(auth);
                  router.push("/login");
                } catch {
                  setLoggingOut(false);
                }
              }}
            >
              <LogOut size={17} />
              {loggingOut ? "Cerrando..." : "Cerrar Sesión"}
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main style={mainStyle}>

        {/* Topbar mobile — só aparece em telas pequenas */}
        {isMobile && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                color: "var(--foreground)",
                cursor: "pointer",
                width: 36,
                height: 36,
                borderRadius: 8,
              }}
            >
              <Menu size={22} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                background: "#1e40af",
                borderRadius: 6,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Ambulance size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)" }}>
                Ambulancias
              </span>
            </div>

            <div style={{ width: 36 }} />
          </div>
        )}

        {children}
      </main>

      {/* Bottom Navigation — só aparece no mobile */}
      {isMobile && (
        <nav style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "6px 4px",
          paddingBottom: "max(6px, env(safe-area-inset-bottom))",
          zIndex: 90,
          boxShadow: "0 -2px 16px rgba(0,0,0,0.08)",
        }}>
          {mobileNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  textDecoration: "none",
                  color: isActive ? "var(--primary)" : "var(--muted)",
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: 8,
                  flex: 1,
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={21} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              background: "none",
              border: "none",
              color: "var(--muted)",
              fontSize: "0.62rem",
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: 8,
              flex: 1,
              cursor: "pointer",
            }}
          >
            <Menu size={21} />
            <span>Más</span>
          </button>
        </nav>
      )}
    </div>
  );
}
