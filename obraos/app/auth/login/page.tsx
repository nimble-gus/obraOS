"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/platform";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm rounded-2xl border p-8 shadow-sm" style={{ background: "var(--bg2)", borderColor: "var(--border)" }}>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--text)" }}>obraOS</h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text3)" }}>
          Gestión de proyectos de construcción
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text2)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border px-3 py-2.5 outline-none transition focus:ring-2"
              style={{ borderColor: "var(--border2)", background: "var(--bg3)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text2)" }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border px-3 py-2.5 outline-none transition focus:ring-2"
              style={{ borderColor: "var(--border2)", background: "var(--bg3)", color: "var(--text)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-2.5 font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring-2 disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
