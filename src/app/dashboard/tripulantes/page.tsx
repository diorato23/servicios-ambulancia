"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import Link from "next/link";
import { Users, Plus, Search } from "lucide-react";

interface Tripulante extends DocumentData {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  rol: string;
  tarjetaProfesional: string;
  telefono: string;
  correo: string;
  estado: string;
}

const rolBadge: Record<string, string> = {
  Médico: "badge-blue",
  Enfermero: "badge-green",
  "Técnico en emergencias": "badge-yellow",
  Paramédico: "badge-orange",
  Conductor: "badge-purple",
};

const estadoBadge: Record<string, string> = {
  Activo: "badge-green",
  Inactivo: "badge-gray",
  "En servicio": "badge-blue",
  "De licencia": "badge-yellow",
};

export default function TripulantesPage() {
  const [tripulantes, setTripulantes] = useState<Tripulante[]>([]);
  const [buscar, setBuscar] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "tripulantes"), orderBy("nombreCompleto"));
    const unsub = onSnapshot(q, (snap) => {
      setTripulantes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Tripulante[]);
      setCargando(false);
    }, () => setCargando(false));
    return () => unsub();
  }, []);

  const filtrados = tripulantes.filter((t) => {
    if (filtroRol && t.rol !== filtroRol) return false;
    if (!buscar) return true;
    const term = buscar.toLowerCase();
    return t.nombreCompleto?.toLowerCase().includes(term) || t.numeroDocumento?.includes(term) || t.rol?.toLowerCase().includes(term);
  });

  const contadores = {
    total: tripulantes.length,
    activos: tripulantes.filter((t) => t.estado === "Activo").length,
    enServicio: tripulantes.filter((t) => t.estado === "En servicio").length,
    medicos: tripulantes.filter((t) => t.rol === "Médico").length,
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Tripulantes</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>Gestión del personal médico y de operaciones</div>
        </div>
        <Link href="/dashboard/tripulantes/nuevo" className="btn btn-primary"><Plus size={15} /> Nuevo Tripulante</Link>
      </div>

      <div className="page-content">
        {/* Contadores */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Total Personal</div>
            <div className="stat-value">{contadores.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Activos</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{contadores.activos}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">En Servicio</div>
            <div className="stat-value" style={{ color: "var(--primary)" }}>{contadores.enServicio}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Médicos</div>
            <div className="stat-value">{contadores.medicos}</div>
          </div>
        </div>

        {/* Buscador */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input className="form-input" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar por nombre, documento, rol..." style={{ paddingLeft: 38 }} />
            </div>
            <select className="form-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} style={{ width: 220 }}>
              <option value="">Todos los roles</option>
              <option value="Médico">Médico</option>
              <option value="Enfermero">Enfermero</option>
              <option value="Paramédico">Paramédico</option>
              <option value="Técnico en emergencias">Técnico en Emergencias</option>
              <option value="Conductor">Conductor</option>
            </select>
            {(buscar || filtroRol) && <button className="btn btn-outline" onClick={() => { setBuscar(""); setFiltroRol(""); }}>Limpiar</button>}
          </div>
        </div>

        {/* Tabla */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: "0.95rem" }}>
              {cargando ? "Cargando..." : filtrados.length === 0 ? "Sin resultados" : `${filtrados.length} tripulante${filtrados.length !== 1 ? "s" : ""}`}
            </strong>
          </div>
          {!cargando && filtrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}>
              <Users size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
              <p style={{ fontSize: "0.875rem" }}>Aún no hay tripulantes registrados.</p>
              <Link href="/dashboard/tripulantes/nuevo" className="btn btn-primary" style={{ marginTop: 16 }}>Registrar primer tripulante</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Rol</th>
                    <th>Tarjeta Prof.</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.nombreCompleto}</td>
                      <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{t.tipoDocumento} {t.numeroDocumento}</td>
                      <td><span className={`badge ${rolBadge[t.rol] || "badge-gray"}`}>{t.rol}</span></td>
                      <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{t.tarjetaProfesional || "—"}</td>
                      <td style={{ fontSize: "0.85rem" }}>{t.telefono || "—"}</td>
                      <td><span className={`badge ${estadoBadge[t.estado] || "badge-gray"}`}>{t.estado}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={`/dashboard/tripulantes/${t.id}`} className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>Ver</Link>
                          <Link href={`/dashboard/tripulantes/${t.id}/editar`} className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>Editar</Link>
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
