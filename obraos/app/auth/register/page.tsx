"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BlocksBackground } from "@/app/components/BlocksBackground";

function RegisterForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrarse");
        setLoading(false);
        return;
      }

      // Si el registro fue exitoso, iniciamos sesión automáticamente
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Error al iniciar sesión automáticamente");
        setLoading(false);
        return;
      }

      router.push("/platform");
      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden bg-[#09090b]">
      <BlocksBackground />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 p-10 shadow-2xl backdrop-blur-xl bg-black/40">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Image
              src="/obri.png"
              alt="obrit"
              width={160}
              height={48}
              className="h-10 w-auto object-contain cursor-pointer"
            />
          </Link>
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-white">
          Crear cuenta
        </h2>
        <p className="mb-8 text-center text-sm text-neutral-400">
          Únete a la plataforma del futuro
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              htmlFor="nombre"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
            >
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:ring-2 focus:ring-[#ccff00]/50"
              placeholder="Juan Pérez"
            />
          </div>
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
              minLength={6}
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
            {loading ? "Creando..." : "Registrarse"}
          </button>

          <div className="mt-4 text-center text-sm text-neutral-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-[#ccff00] hover:underline font-semibold">
              Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
          <span className="text-[#ccff00] font-semibold animate-pulse">Cargando...</span>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
