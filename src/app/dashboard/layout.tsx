"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ClipboardList,
  Ambulance,
  UserCheck,
  FileText,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                background: "#1e40af",
                borderRadius: 8,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ambulance size={18} color="#fff" />
            </div>
            <div>
              <h1>Ambulancias</h1>
              <p>Sistema de Gestión CRM</p>
            </div>
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

        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button className="sidebar-link" style={{ width: "100%", background: "none", border: "none" }}>
            <LogOut size={17} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">{children}</main>
    </div>
  );
}
