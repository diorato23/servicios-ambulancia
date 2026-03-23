"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Ambulance, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import "./login.css";

type Tab = "login" | "register";

export default function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Capturar resultado do redirect do Google após retorno
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        const firebaseErr = err as { code?: string };
        if (firebaseErr.code) {
          setError(getFirebaseErrorMessage(firebaseErr.code));
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    clearMessages();
  };

  const getFirebaseErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      "auth/invalid-email": "Correo electrónico inválido.",
      "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
      "auth/user-not-found": "No existe una cuenta con este correo.",
      "auth/wrong-password": "Contraseña incorrecta.",
      "auth/invalid-credential": "Credenciales inválidas. Verifique su correo y contraseña.",
      "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
      "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
      "auth/too-many-requests": "Demasiados intentos. Intente de nuevo más tarde.",
      "auth/popup-closed-by-user": "Se cerró la ventana de autenticación.",
      "auth/network-request-failed": "Error de red. Verifique su conexión a internet.",
      "auth/operation-not-allowed": "Este método de autenticación no está habilitado. Contacte al administrador.",
      "auth/configuration-not-found": "Configuración de Firebase no encontrada. Verifique la configuración del proyecto.",
    };
    return messages[code] || `Error de autenticación (${code || "desconocido"}). Intente de nuevo.`;
  };

  // --- Login ---
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password) {
      setError("Ingrese su correo y contraseña.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      setError(getFirebaseErrorMessage(firebaseErr.code || ""));
    } finally {
      setLoading(false);
    }
  };

  // --- Register ---
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError("Complete todos los campos.");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      await updateProfile(cred.user, { displayName: regName });
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      setError(getFirebaseErrorMessage(firebaseErr.code || ""));
    } finally {
      setLoading(false);
    }
  };

  // --- Google ---
  const handleGoogle = async () => {
    clearMessages();
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // O redirect vai sair da página — o resultado é capturado no useEffect
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      setError(getFirebaseErrorMessage(firebaseErr.code || ""));
      setLoading(false);
    }
  };

  // --- Forgot Password ---
  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!forgotEmail) {
      setError("Ingrese su correo electrónico.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setSuccess("Se ha enviado un enlace de recuperación a su correo.");
      setForgotEmail("");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      setError(getFirebaseErrorMessage(firebaseErr.code || ""));
    } finally {
      setLoading(false);
    }
  };

  // --- Google Icon SVG ---
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Branding */}
        <div className="login-brand">
          <div className="login-logo">
            <Ambulance size={26} color="#fff" />
          </div>
          <h1>Servicios de Ambulancia</h1>
          <p>Sistema de Gestión CRM</p>
        </div>

        {/* Forgot Password View */}
        {showForgot ? (
          <>
            <form className="login-form" onSubmit={handleForgot}>
              <div style={{ textAlign: "center", marginBottom: 4 }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>
                  Recuperar Contraseña
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>
                  Ingrese su correo y le enviaremos un enlace para restablecer su contraseña.
                </p>
              </div>

              {error && (
                <div className="login-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              {success && (
                <div className="login-success">
                  <CheckCircle size={16} />
                  {success}
                </div>
              )}

              <div className="login-field">
                <label htmlFor="forgot-email">Correo Electrónico</label>
                <div className="login-input-wrapper">
                  <Mail size={17} className="field-icon" />
                  <input
                    id="forgot-email"
                    name="forgot-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit" className="login-btn-primary" disabled={loading}>
                {loading && <span className="login-spinner" />}
                Enviar Enlace
              </button>

              <div className="login-footer">
                <button type="button" onClick={() => { setShowForgot(false); clearMessages(); }}>
                  ← Volver al inicio de sesión
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Tabs */}
            <div className="login-tabs">
              <button
                className={`login-tab ${tab === "login" ? "active" : ""}`}
                onClick={() => switchTab("login")}
                type="button"
              >
                Iniciar Sesión
              </button>
              <button
                className={`login-tab ${tab === "register" ? "active" : ""}`}
                onClick={() => switchTab("register")}
                type="button"
              >
                Registrarse
              </button>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="login-error" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {success && (
              <div className="login-success" style={{ marginBottom: 16 }}>
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            {/* ====== LOGIN FORM ====== */}
            {tab === "login" && (
              <form className="login-form" onSubmit={handleLogin} key="login">
                <div className="login-field">
                  <label htmlFor="login-email">Correo Electrónico</label>
                  <div className="login-input-wrapper">
                    <Mail size={17} className="field-icon" />
                    <input
                      id="login-email"
                      name="login-email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="login-password">Contraseña</label>
                  <div className="login-input-wrapper">
                    <Lock size={17} className="field-icon" />
                    <input
                      id="login-password"
                      name="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-forgot">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      clearMessages();
                      setShowForgot(true);
                    }}
                  >
                    ¿Olvidó su contraseña?
                  </a>
                </div>

                <button type="submit" className="login-btn-primary" disabled={loading}>
                  {loading && <span className="login-spinner" />}
                  Iniciar Sesión
                </button>

                <div className="login-divider">
                  <span>o continuar con</span>
                </div>

                <button type="button" className="login-btn-google" onClick={handleGoogle} disabled={loading}>
                  <GoogleIcon />
                  Google
                </button>

                <div className="login-footer">
                  ¿No tiene una cuenta?
                  <button type="button" onClick={() => switchTab("register")}>
                    Registrarse
                  </button>
                </div>
              </form>
            )}

            {/* ====== REGISTER FORM ====== */}
            {tab === "register" && (
              <form className="login-form" onSubmit={handleRegister} key="register">
                <div className="login-field">
                  <label htmlFor="register-name">Nombre Completo</label>
                  <div className="login-input-wrapper">
                    <User size={17} className="field-icon" />
                    <input
                      id="register-name"
                      name="register-name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="register-email">Correo Electrónico</label>
                  <div className="login-input-wrapper">
                    <Mail size={17} className="field-icon" />
                    <input
                      id="register-email"
                      name="register-email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="register-password">Contraseña</label>
                  <div className="login-input-wrapper">
                    <Lock size={17} className="field-icon" />
                    <input
                      id="register-password"
                      name="register-password"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="register-confirm">Confirmar Contraseña</label>
                  <div className="login-input-wrapper">
                    <Lock size={17} className="field-icon" />
                    <input
                      id="register-confirm"
                      name="register-confirm"
                      type={showRegConfirm ? "text" : "password"}
                      placeholder="Repita su contraseña"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRegConfirm(!showRegConfirm)}
                      aria-label={showRegConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showRegConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="login-btn-primary" disabled={loading}>
                  {loading && <span className="login-spinner" />}
                  Crear Cuenta
                </button>

                <div className="login-divider">
                  <span>o continuar con</span>
                </div>

                <button type="button" className="login-btn-google" onClick={handleGoogle} disabled={loading}>
                  <GoogleIcon />
                  Google
                </button>

                <div className="login-footer">
                  ¿Ya tiene una cuenta?
                  <button type="button" onClick={() => switchTab("login")}>
                    Iniciar Sesión
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
