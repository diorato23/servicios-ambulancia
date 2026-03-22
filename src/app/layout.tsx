import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";

export const metadata: Metadata = {
  title: "CRM Servicios Ambulancia",
  description: "Sistema de gestión clínica para servicios de ambulancia — funciona offline",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ambulancias",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a2340",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
