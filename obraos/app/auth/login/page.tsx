"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
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
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: "url(/login.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/20" aria-hidden />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/20 p-8 shadow-2xl backdrop-blur-xl"
        style={{ background: "rgba(55,55,55,0.5)" }}
      >
        <div className="mb-6 flex justify-center">
          <Image
            src="/obri.png"
            alt="obraOS"
            width={308}
            height={168}
            className="h-[6.3rem] w-[12.6rem] object-contain"
          />
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-gray-300">
          Iniciar sesión
        </h2>
        <p className="mb-6 text-center text-sm text-gray-400">
          Gestión de proyectos de construcción
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-300"
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
              className="w-full rounded-xl border border-white/30 bg-white/90 px-3 py-2.5 text-black outline-none transition placeholder:text-black/50 focus:ring-2 focus:ring-white/50"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-300"
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
              className="w-full rounded-xl border border-white/30 bg-white/90 px-3 py-2.5 text-black outline-none transition placeholder:text-black/50 focus:ring-2 focus:ring-white/50"
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
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/login.jpg)" }}
        >
          <span className="text-white drop-shadow">Cargando...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
