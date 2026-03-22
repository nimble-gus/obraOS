"use client";

import { usePathname } from "next/navigation";
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

export function PlatformTopbar({ 
  userName, 
  onMenuClick 
}: { 
  userName?: string;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();

  const basePath = pathname.split("/").slice(0, 3).join("/");
  const label = LABELS[basePath] ?? "Plataforma";

  return (
    <header
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-8 bg-[#111113]/80 backdrop-blur-md"
      style={{
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            type="button"
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 text-[var(--text2)] hover:text-white transition-colors"
            onClick={onMenuClick}
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div
          className="text-sm font-semibold tracking-wide truncate"
          style={{ color: "var(--text2)" }}
        >
          Home <span className="hidden sm:inline" style={{ color: "var(--text)" }}>/ {label}</span>
          <span className="sm:hidden" style={{ color: "var(--text)" }}>/ {label.split(' ')[0]}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <UserAvatarMenu userName={userName} variant="platform" />
      </div>
    </header>
  );
}
