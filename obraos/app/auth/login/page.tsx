"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlocksBackground } from "@/app/components/BlocksBackground";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden bg-[#09090b]">
      <BlocksBackground />
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 p-10 shadow-2xl backdrop-blur-xl bg-black/40"
      >
        <div className="mb-6 flex justify-center">
          <Image
            src="/obri.png"
            alt="obrit"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
          />
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-white">
          Iniciar sesión
        </h2>
        <p className="mb-8 text-center text-sm text-neutral-400">
          Gestión de proyectos de construcción
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20"
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:ring-2 focus:ring-[#ccff00]/50"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:ring-2 focus:ring-[#ccff00]/50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl px-4 py-3.5 font-bold text-black transition hover:opacity-90 hover:scale-[1.02] focus:outline-none focus:ring-2 disabled:opacity-60 shadow-lg"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
          <span className="text-[#ccff00] font-semibold animate-pulse">Cargando plataforma...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
