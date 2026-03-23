"use client";

import dynamic from "next/dynamic";

// Importação dinâmica SEM SSR — evita erro de hidratação
// A tela de login não precisa de SSR/SEO
const LoginForm = dynamic(() => import("./LoginForm"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #dbeafe 0%, #f8fafc 50%, #e0e7ff 100%)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid #dbeafe",
          borderTopColor: "#1e40af",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function LoginPage() {
  return <LoginForm />;
}
