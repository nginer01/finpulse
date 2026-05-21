"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, register } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import type { AuthError } from "@/lib/auth";

const inputClass = "w-full bg-white border rounded-xl px-5 py-3.5 text-[14px] text-[#1a1a1a] placeholder-[#ccc] outline-none focus:border-[#1a1a1a]/40 transition-colors duration-300";
const labelClass = "block text-[11px] uppercase tracking-[0.2em] text-[#999] font-semibold mb-2.5";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres", ok: password.length >= 8 },
    { label: "Mayuscula", ok: /[A-Z]/.test(password) },
    { label: "Numero", ok: /[0-9]/.test(password) },
    { label: "Simbolo", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["#e5e0db", "#c4001a", "#b8860b", "#b8860b", "#1a1a1a"];
  return (
    <div className="mt-3">
      <div className="flex gap-1.5 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full transition-all duration-500" style={{ backgroundColor: i < score ? colors[score] : "#f0ede8" }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={`text-[10px] font-semibold transition-colors duration-300 ${c.ok ? "text-[#1a1a1a]" : "text-[#ccc]"}`}>
            {c.ok ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError("");
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    resetForm();
  };

  const validate = (): string | null => {
    if (!email.trim()) return "Introduce tu email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email no valido";
    if (!password) return "Introduce tu contrasena";

    if (mode === "register") {
      if (!name.trim()) return "Introduce tu nombre";
      if (password.length < 8) return "La contrasena debe tener al menos 8 caracteres";
      if (!/[A-Z]/.test(password)) return "La contrasena necesita al menos una mayuscula";
      if (!/[0-9]/.test(password)) return "La contrasena necesita al menos un numero";
      if (password !== confirmPassword) return "Las contrasenas no coinciden";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const data = await login(email, password);
        setUser({
          id: data.user_id,
          name: data.name,
          email: data.email,
          experience_level: "intermedio",
          timezone: "Europe/Madrid",
        });
      } else {
        const data = await register(email, password, name);
        setUser({
          id: data.user_id,
          name: data.name,
          email: data.email,
          experience_level: "intermedio",
          timezone: "Europe/Madrid",
        });
      }
      router.push("/");
    } catch (err: unknown) {
      const authErr = err as AuthError;
      setError(authErr.detail || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6 login-page">
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <Link href="/landing" className="block text-center mb-14">
          <p className="text-[18px] tracking-[0.3em] uppercase font-semibold text-[#1a1a1a]" style={{ transform: "scaleY(0.88)" }}>FinPulse</p>
          <p className="text-[11px] text-[#bbb] tracking-[0.15em] mt-2 font-normal">Inteligencia financiera personal</p>
        </Link>

        {/* Toggle */}
        <div className="flex mb-10 border-b border-[#e5e0db]">
          <button onClick={() => switchMode("login")}
            className={`flex-1 pb-4 text-[12px] uppercase tracking-[0.25em] font-semibold transition-all duration-500 border-b-2 -mb-[1px] ${mode === "login" ? "text-[#1a1a1a] border-[#1a1a1a]" : "text-[#ccc] border-transparent hover:text-[#999]"}`}>
            Iniciar sesion
          </button>
          <button onClick={() => switchMode("register")}
            className={`flex-1 pb-4 text-[12px] uppercase tracking-[0.25em] font-semibold transition-all duration-500 border-b-2 -mb-[1px] ${mode === "register" ? "text-[#1a1a1a] border-[#1a1a1a]" : "text-[#ccc] border-transparent hover:text-[#999]"}`}>
            Crear cuenta
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#c4001a]/[0.06] border border-[#c4001a]/15 flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><circle cx="8" cy="8" r="7" stroke="#c4001a" strokeWidth="1.2"/><path d="M8 5v3.5M8 10.5v.5" stroke="#c4001a" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <p className="text-[12px] text-[#c4001a] font-medium leading-[1.6]">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "register" && (
            <div>
              <label className={labelClass}>Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre" className={`${inputClass} ${!name.trim() && error?.includes("nombre") ? "border-[#c4001a]/40" : "border-[#e5e0db]"}`} />
            </div>
          )}

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="tu@email.com" className={`${inputClass} ${error?.includes("email") || error?.includes("Email") ? "border-[#c4001a]/40" : "border-[#e5e0db]"}`} />
          </div>

          <div>
            <label className={labelClass}>Contrasena</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                className={`${inputClass} pr-12 ${error?.includes("contrasena") && !error.includes("coinciden") ? "border-[#c4001a]/40" : "border-[#e5e0db]"}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ccc] hover:text-[#999] transition-colors">
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {mode === "register" && password.length > 0 && <PasswordStrength password={password} />}
          </div>

          {mode === "register" && (
            <div>
              <label className={labelClass}>Confirmar contrasena</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12 ${passwordsMismatch ? "border-[#c4001a]/40" : passwordsMatch ? "border-[#1a1a1a]/30" : "border-[#e5e0db]"}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ccc] hover:text-[#999] transition-colors">
                  {showConfirm ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {passwordsMismatch && <p className="text-[11px] text-[#c4001a] mt-2 font-medium">Las contrasenas no coinciden</p>}
              {passwordsMatch && <p className="text-[11px] text-[#1a1a1a] mt-2 font-medium">✓ Las contrasenas coinciden</p>}
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <button type="button" className="text-[12px] text-[#999] hover:text-[#1a1a1a] transition-colors duration-300">
                He olvidado mi contrasena
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.25em] font-semibold py-4 rounded-xl hover:bg-[#333] transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-[#e5e0db]" />
          <span className="text-[11px] text-[#ccc] uppercase tracking-[0.15em] font-semibold">o continua con</span>
          <div className="flex-1 h-px bg-[#e5e0db]" />
        </div>

        {/* Social login */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2.5 bg-white border border-[#e5e0db] rounded-xl py-3.5 hover:border-[#1a1a1a]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="text-[12px] text-[#555] font-semibold">Google</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2.5 bg-white border border-[#e5e0db] rounded-xl py-3.5 hover:border-[#1a1a1a]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a1a"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.39-.04-.59 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.21.06.43.06.66h.224zm4.565 17.71c-.4.93-.59 1.35-1.107 2.17-.72 1.15-1.735 2.59-2.993 2.6-1.12.01-1.408-.735-2.927-.724-1.52.01-1.838.738-2.958.727-1.258-.012-2.215-1.3-2.935-2.45-2.013-3.215-2.223-6.99-.982-8.99.88-1.42 2.27-2.25 3.55-2.25 1.32 0 2.15.74 3.24.74 1.06 0 1.7-.74 3.23-.74 1.14 0 2.37.62 3.25 1.69-2.86 1.57-2.4 5.64.63 6.74z"/></svg>
            <span className="text-[12px] text-[#555] font-semibold">Apple</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#ccc] mt-12 leading-[1.8]">
          Al continuar, aceptas los <button className="text-[#999] underline underline-offset-2">terminos de uso</button> y la <button className="text-[#999] underline underline-offset-2">politica de privacidad</button>.
        </p>
      </div>

      <style jsx global>{`
        .login-page { font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .login-page input:focus { box-shadow: 0 0 0 3px rgba(26,26,26,0.06); }
      `}</style>
    </main>
  );
}
