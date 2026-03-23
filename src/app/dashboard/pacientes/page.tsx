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
import { Users, Plus, Search } from "lucide-react";

interface Paciente extends DocumentData {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaNacimiento: string;
  sexo: string;
  telefono?: string;
  municipio?: string;
  eps?: string;
  tipoAfiliacion?: string;
}

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [buscar, setBuscar] = useState("");
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
    // onSnapshot — activo en tiempo real, también funciona offline con cache
    const q = query(
      collection(db, "pacientes"),
      orderBy("fechaRegistro", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data: Paciente[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Paciente[];
        setPacientes(data);
        setCargando(false);
      },
      (error) => {
        console.error("Error al cargar pacientes:", error);
        setCargando(false);
      }
    );
    return () => unsub();
  }, []);

  const filtrados = pacientes.filter((p) => {
    if (!buscar) return true;
    const term = buscar.toLowerCase();
    return (
      p.numeroDocumento?.toLowerCase().includes(term) ||
      p.primerNombre?.toLowerCase().includes(term) ||
      p.primerApellido?.toLowerCase().includes(term) ||
      p.segundoApellido?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      {offline && (
        <div
          style={{
            background: "var(--warning-light, #fff3cd)",
            color: "var(--warning, #856404)",
            padding: "10px 20px",
            fontSize: "0.82rem",
            fontWeight: 600,
            textAlign: "center",
            borderBottom: "1px solid #ffc107",
          }}
        >
          📴 Sin conexión — mostrando datos en caché. Los cambios se
          sincronizarán al recuperar la señal.
        </div>
      )}

      <div className="topbar">
        <div>
          <div className="topbar-title">Pacientes</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
            Registro y gestión de pacientes
          </div>
        </div>
        <Link href="/dashboard/pacientes/nuevo" className="btn btn-primary">
          <Plus size={15} />
          Nuevo Paciente
        </Link>
      </div>

      <div className="page-content">
        {/* Buscador */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="search-bar" style={{ flex: 1, position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted)",
                }}
              />
              <input
                className="form-input"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                placeholder="Buscar por nombre, apellido o número de documento..."
                style={{ paddingLeft: 38 }}
              />
            </div>
            {buscar && (
              <button
                className="btn btn-outline"
                onClick={() => setBuscar("")}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <strong style={{ fontSize: "0.95rem" }}>
              {cargando
                ? "Cargando..."
                : filtrados.length === 0
                  ? "Sin resultados"
                  : `${filtrados.length} paciente${filtrados.length !== 1 ? "s" : ""}`}
            </strong>
          </div>

          {!cargando && filtrados.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted)" }}
            >
              <Users
                size={40}
                style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }}
              />
              <p style={{ fontSize: "0.875rem" }}>
                {buscar
                  ? "No se encontraron pacientes con esos datos."
                  : "Aún no hay pacientes registrados."}
              </p>
              <Link
                href="/dashboard/pacientes/nuevo"
                className="btn btn-primary"
                style={{ marginTop: 16 }}
              >
                Registrar primer paciente
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Nombre Completo</th>
                    <th>Edad</th>
                    <th>Sexo</th>
                    <th>Municipio</th>
                    <th>EPS / Afiliación</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => {
                    const nombre = [
                      p.primerNombre,
                      p.segundoNombre,
                      p.primerApellido,
                      p.segundoApellido,
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {p.numeroDocumento}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                            {p.tipoDocumento}
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{nombre}</td>
                        <td>
                          {p.fechaNacimiento
                            ? calcularEdad(p.fechaNacimiento) + " años"
                            : "—"}
                        </td>
                        <td>
                          <span
                            className={`badge ${p.sexo === "Masculino" ? "badge-blue" : p.sexo === "Femenino" ? "badge-red" : "badge-gray"}`}
                          >
                            {p.sexo}
                          </span>
                        </td>
                        <td style={{ color: "var(--muted)" }}>
                          {p.municipio || "—"}
                        </td>
                        <td>
                          <div style={{ fontSize: "0.875rem" }}>
                            {p.eps || "—"}
                          </div>
                          {p.tipoAfiliacion && (
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                              {p.tipoAfiliacion}
                            </div>
                          )}
                        </td>
                        <td style={{ color: "var(--muted)" }}>
                          {p.telefono || "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link
                              href={`/dashboard/pacientes/${p.id}`}
                              className="btn btn-outline"
                              style={{ padding: "5px 12px", fontSize: "0.8rem" }}
                            >
                              Ver
                            </Link>
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
