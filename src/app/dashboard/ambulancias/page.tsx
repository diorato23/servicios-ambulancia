"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import Link from "next/link";
import { Truck, Plus, Search } from "lucide-react";

interface Ambulancia extends DocumentData {
  id: string;
  placa: string;
  tipoAmbulancia: string;
  marca: string;
  modelo: string;
  anio: string;
  estado: string;
  gpsId: string;
}

const estadoBadge: Record<string, string> = {
  Disponible: "badge-green",
  "En servicio": "badge-blue",
  "En mantenimiento": "badge-yellow",
  "Fuera de servicio": "badge-red",
};

const tipoLabel: Record<string, string> = {
  TAB: "TAB — Básico",
  TAM: "TAM — Medicalizado",
  "TAM-UCI": "TAM-UCI — Cuidados Intensivos",
};

export default function AmbulanciasPage() {
  const [ambulancias, setAmbulancias] = useState<Ambulancia[]>([]);
  const [buscar, setBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "ambulancias"), orderBy("placa"));
    const unsub = onSnapshot(q, (snap) => {
      setAmbulancias(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Ambulancia[]);
      setCargando(false);
    }, () => setCargando(false));
    return () => unsub();
  }, []);

  const filtrados = ambulancias.filter((a) => {
    if (filtroEstado && a.estado !== filtroEstado) return false;
    if (!buscar) return true;
    const term = buscar.toLowerCase();
    return a.placa?.toLowerCase().includes(term) || a.marca?.toLowerCase().includes(term) || a.modelo?.toLowerCase().includes(term) || a.tipoAmbulancia?.toLowerCase().includes(term);
  });

  const contadores = {
    total: ambulancias.length,
    disponibles: ambulancias.filter((a) => a.estado === "Disponible").length,
    enServicio: ambulancias.filter((a) => a.estado === "En servicio").length,
    mantenimiento: ambulancias.filter((a) => a.estado === "En mantenimiento").length,
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Ambulancias</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>Gestión de la flota de ambulancias</div>
        </div>
        <Link href="/dashboard/ambulancias/nueva" className="btn btn-primary"><Plus size={15} /> Nueva Ambulancia</Link>
      </div>

      <div className="page-content">
        {/* Contadores */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="stat-card" onClick={() => setFiltroEstado("")} style={{ cursor: "pointer", border: !filtroEstado ? "2px solid var(--primary)" : undefined }}>
            <div className="stat-label">Total Flota</div>
            <div className="stat-value">{contadores.total}</div>
          </div>
          <div className="stat-card" onClick={() => setFiltroEstado("Disponible")} style={{ cursor: "pointer", border: filtroEstado === "Disponible" ? "2px solid var(--success)" : undefined }}>
            <div className="stat-label">Disponibles</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{contadores.disponibles}</div>
          </div>
          <div className="stat-card" onClick={() => setFiltroEstado("En servicio")} style={{ cursor: "pointer", border: filtroEstado === "En servicio" ? "2px solid var(--primary)" : undefined }}>
            <div className="stat-label">En Servicio</div>
            <div className="stat-value" style={{ color: "var(--primary)" }}>{contadores.enServicio}</div>
          </div>
          <div className="stat-card" onClick={() => setFiltroEstado("En mantenimiento")} style={{ cursor: "pointer", border: filtroEstado === "En mantenimiento" ? "2px solid var(--warning)" : undefined }}>
            <div className="stat-label">Mantenimiento</div>
            <div className="stat-value" style={{ color: "var(--warning)" }}>{contadores.mantenimiento}</div>
          </div>
        </div>

        {/* Buscador */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input className="form-input" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar por placa, marca, modelo..." style={{ paddingLeft: 38 }} />
            </div>
            <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: 200 }}>
              <option value="">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="En servicio">En servicio</option>
              <option value="En mantenimiento">En mantenimiento</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>
            {(buscar || filtroEstado) && <button className="btn btn-outline" onClick={() => { setBuscar(""); setFiltroEstado(""); }}>Limpiar</button>}
          </div>
        </div>

        {/* Tabla */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: "0.95rem" }}>
              {cargando ? "Cargando..." : filtrados.length === 0 ? "Sin resultados" : `${filtrados.length} ambulancia${filtrados.length !== 1 ? "s" : ""}`}
            </strong>
          </div>

          {!cargando && filtrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}>
              <Truck size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
              <p style={{ fontSize: "0.875rem" }}>Aún no hay ambulancias registradas.</p>
              <Link href="/dashboard/ambulancias/nueva" className="btn btn-primary" style={{ marginTop: 16 }}>Registrar primera ambulancia</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Tipo</th>
                    <th>Marca / Modelo</th>
                    <th>Año</th>
                    <th>Estado</th>
                    <th>GPS</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.03em" }}>{a.placa}</td>
                      <td><span className="badge badge-blue">{a.tipoAmbulancia}</span></td>
                      <td>{a.marca} {a.modelo}</td>
                      <td style={{ color: "var(--muted)" }}>{a.anio || "—"}</td>
                      <td><span className={`badge ${estadoBadge[a.estado] || "badge-gray"}`}>{a.estado}</span></td>
                      <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{a.gpsId || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={`/dashboard/ambulancias/${a.id}`} className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>Ver</Link>
                          <Link href={`/dashboard/ambulancias/${a.id}/editar`} className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>Editar</Link>
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
