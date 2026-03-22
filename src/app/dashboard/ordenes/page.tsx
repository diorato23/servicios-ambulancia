"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";
import { ClipboardList, Plus, Search, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface Orden extends DocumentData {
  id: string;
  fechaHoraSolicitud: string;
  canalSolicitud: string;
  nombreSolicitante: string;
  telefonoSolicitante: string;
  direccionOrigen: string;
  direccionDestino: string;
  tipoServicio: string;
  tipoAmbulancia: string;
  prioridad: string;
  motivoSolicitud: string;
  idPaciente: string;
  nombrePaciente: string;
  estadoOS: string;
}

const estadoBadge: Record<string, string> = {
  Pendiente: "badge-yellow",
  "En camino": "badge-blue",
  "En escena": "badge-orange",
  "En traslado": "badge-purple",
  Completada: "badge-green",
  Cancelada: "badge-red",
};

const prioridadIcon: Record<string, { color: string; label: string }> = {
  Alta: { color: "var(--danger)", label: "🔴 Alta" },
  Media: { color: "var(--warning)", label: "🟡 Media" },
  Baja: { color: "var(--success)", label: "🟢 Baja" },
};

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [buscar, setBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "ordenes_servicio"),
      orderBy("fechaRegistro", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data: Orden[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Orden[];
        setOrdenes(data);
        setCargando(false);
      },
      (error) => {
        console.error("Error al cargar órdenes:", error);
        setCargando(false);
      }
    );
    return () => unsub();
  }, []);

  const filtrados = ordenes.filter((o) => {
    if (filtroEstado && o.estadoOS !== filtroEstado) return false;
    if (!buscar) return true;
    const term = buscar.toLowerCase();
    return (
      o.nombrePaciente?.toLowerCase().includes(term) ||
      o.nombreSolicitante?.toLowerCase().includes(term) ||
      o.direccionOrigen?.toLowerCase().includes(term) ||
      o.tipoServicio?.toLowerCase().includes(term)
    );
  });

  const contadores = {
    total: ordenes.length,
    pendientes: ordenes.filter((o) => o.estadoOS === "Pendiente").length,
    enProceso: ordenes.filter((o) => ["En camino", "En escena", "En traslado"].includes(o.estadoOS)).length,
    completadas: ordenes.filter((o) => o.estadoOS === "Completada").length,
  };

  return (
    <>
      {offline && (
        <div style={{ background: "var(--warning-light, #fff3cd)", color: "var(--warning, #856404)", padding: "10px 20px", fontSize: "0.82rem", fontWeight: 600, textAlign: "center", borderBottom: "1px solid #ffc107" }}>
          📴 Sin conexión — mostrando datos en caché.
        </div>
      )}

      <div className="topbar">
        <div>
          <div className="topbar-title">Órdenes de Servicio</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
            Gestión de solicitudes de ambulancia
          </div>
        </div>
        <Link href="/dashboard/ordenes/nueva" className="btn btn-primary">
          <Plus size={15} /> Nueva Orden
        </Link>
      </div>

      <div className="page-content">
        {/* Contadores */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card" onClick={() => setFiltroEstado("")} style={{ cursor: "pointer", border: !filtroEstado ? "2px solid var(--primary)" : undefined }}>
            <div className="stat-label">Total</div>
            <div className="stat-value">{contadores.total}</div>
          </div>
          <div className="stat-card" onClick={() => setFiltroEstado("Pendiente")} style={{ cursor: "pointer", border: filtroEstado === "Pendiente" ? "2px solid var(--warning)" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div className="stat-label">Pendientes</div><div className="stat-value" style={{ color: "var(--warning)" }}>{contadores.pendientes}</div></div>
              <Clock size={20} color="var(--warning)" style={{ opacity: 0.5 }} />
            </div>
          </div>
          <div className="stat-card" onClick={() => setFiltroEstado("En camino")} style={{ cursor: "pointer", border: filtroEstado === "En camino" ? "2px solid var(--primary)" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div className="stat-label">En Proceso</div><div className="stat-value" style={{ color: "var(--primary)" }}>{contadores.enProceso}</div></div>
              <AlertTriangle size={20} color="var(--primary)" style={{ opacity: 0.5 }} />
            </div>
          </div>
          <div className="stat-card" onClick={() => setFiltroEstado("Completada")} style={{ cursor: "pointer", border: filtroEstado === "Completada" ? "2px solid var(--success)" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div className="stat-label">Completadas</div><div className="stat-value" style={{ color: "var(--success)" }}>{contadores.completadas}</div></div>
              <CheckCircle size={20} color="var(--success)" style={{ opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input className="form-input" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar por paciente, solicitante, dirección..." style={{ paddingLeft: 38 }} />
            </div>
            <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: 180 }}>
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En camino">En camino</option>
              <option value="En escena">En escena</option>
              <option value="En traslado">En traslado</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
            {(buscar || filtroEstado) && (
              <button className="btn btn-outline" onClick={() => { setBuscar(""); setFiltroEstado(""); }}>Limpiar</button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <strong style={{ fontSize: "0.95rem" }}>
              {cargando ? "Cargando..." : filtrados.length === 0 ? "Sin resultados" : `${filtrados.length} orden${filtrados.length !== 1 ? "es" : ""}`}
            </strong>
          </div>

          {!cargando && filtrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}>
              <ClipboardList size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
              <p style={{ fontSize: "0.875rem" }}>{buscar || filtroEstado ? "No se encontraron órdenes con esos filtros." : "Aún no hay órdenes registradas."}</p>
              <Link href="/dashboard/ordenes/nueva" className="btn btn-primary" style={{ marginTop: 16 }}>Crear primera orden</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Paciente</th>
                    <th>Tipo Servicio</th>
                    <th>Origen → Destino</th>
                    <th>Canal</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <span className={`badge ${estadoBadge[o.estadoOS] || "badge-gray"}`}>
                          {o.estadoOS}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: prioridadIcon[o.prioridad]?.color || "var(--muted)" }}>
                          {prioridadIcon[o.prioridad]?.label || o.prioridad || "—"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{o.nombrePaciente || "—"}</td>
                      <td>{o.tipoServicio || "—"}</td>
                      <td>
                        <div style={{ fontSize: "0.82rem" }}>
                          <div>📍 {o.direccionOrigen || "—"}</div>
                          {o.direccionDestino && <div style={{ color: "var(--muted)" }}>→ {o.direccionDestino}</div>}
                        </div>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{o.canalSolicitud || "—"}</td>
                      <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                        {o.fechaHoraSolicitud ? new Date(o.fechaHoraSolicitud).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={`/dashboard/ordenes/${o.id}`} className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>Ver</Link>
                          <Link href={`/dashboard/ordenes/${o.id}/editar`} className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>Editar</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
