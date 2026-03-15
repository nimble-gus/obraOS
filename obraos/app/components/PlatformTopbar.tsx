"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserAvatarMenu } from "./UserAvatarMenu";

const LABELS: Record<string, string> = {
  "/platform": "Proyectos",
  "/platform/proyectos": "Proyectos",
  "/platform/visor": "Control de Obra",
  "/platform/materiales": "Materiales",
  "/platform/planilla": "Planilla",
  "/platform/servicios": "Costos varios",
  "/platform/equipo": "Equipo PM",
  "/platform/perfil": "Mi perfil",
};

export function PlatformTopbar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    if (t === "light" || t === "dark") setThemeState(t);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("obraos-theme", next);
    setThemeState(next);
  };

  const basePath = pathname.split("/").slice(0, 3).join("/");
  const label = LABELS[basePath] ?? "Plataforma";

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b px-6"
      style={{
        background: "var(--bg2)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="text-sm font-semibold"
        style={{ color: "var(--text2)" }}
      >
        Home <span style={{ color: "var(--text)" }}>/ {label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80"
          style={{
            background: "var(--bg3)",
            color: "var(--text2)",
          }}
          aria-label={theme === "light" ? "Cambiar a oscuro" : "Cambiar a claro"}
        >
          {theme === "light" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          )}
        </button>
        <UserAvatarMenu userName={userName} variant="platform" />
      </div>
    </header>
  );
}
