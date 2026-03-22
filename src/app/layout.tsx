import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Servicios Ambulancia",
  description: "Sistema de gestión clínica para servicios de ambulancia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
