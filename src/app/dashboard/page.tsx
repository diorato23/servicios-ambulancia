import {
  Users,
  ClipboardList,
  Ambulance,
  UserCheck,
  FileText,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Pacientes Registrados", value: "—", sub: "Total en sistema", icon: Users, color: "#1e40af" },
  { label: "Órdenes de Servicio", value: "—", sub: "Hoy", icon: ClipboardList, color: "#0891b2" },
  { label: "Ambulancias Disponibles", value: "—", sub: "En servicio", icon: Ambulance, color: "#16a34a" },
  { label: "Tripulantes Activos", value: "—", sub: "En turno", icon: UserCheck, color: "#d97706" },
];

export default function DashboardPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Panel Principal</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
            Sistema de Gestión — Servicios de Ambulancia
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={16} color="var(--muted)" />
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="grid-stats" style={{ marginBottom: 28 }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-sub">{stat.sub}</div>
                  </div>
                  <div
                    style={{
                      background: stat.color + "18",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    <Icon size={20} color={stat.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem" }}>
            Acciones Rápidas
          </h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/dashboard/pacientes/nuevo" className="btn btn-primary">
              <Users size={15} />
              Nuevo Paciente
            </a>
            <a href="/dashboard/ordenes/nueva" className="btn btn-outline">
              <ClipboardList size={15} />
              Nueva Orden de Servicio
            </a>
            <a href="/dashboard/historias/nueva" className="btn btn-outline">
              <FileText size={15} />
              Nueva Historia Clínica
            </a>
          </div>
        </div>

        {/* Órdenes recientes - placeholder */}
        <div className="card">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Órdenes Recientes</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                Últimas solicitudes de servicio registradas
              </p>
            </div>
            <a href="/dashboard/ordenes" className="btn btn-outline" style={{ fontSize: "0.8rem" }}>
              Ver todas
            </a>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "var(--muted)",
            }}
          >
            <ClipboardList size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
            <p style={{ fontSize: "0.875rem" }}>
              No hay órdenes de servicio registradas aún.
            </p>
            <a href="/dashboard/ordenes/nueva" className="btn btn-primary" style={{ marginTop: 16 }}>
              Crear primera orden
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
