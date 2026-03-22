"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PlatformTopbar } from "./PlatformTopbar";
import type { Session } from "next-auth";

function getUserName(user: Session["user"] | undefined): string | undefined {
  if (!user) return undefined;
  const u = user as { nombre?: string; name?: string };
  return u.nombre ?? u.name ?? undefined;
}

const NAV_MAIN = [
  { href: "/platform/proyectos", label: "Proyectos", icon: "grid" },
  { href: "/platform/visor", label: "Control de Obra", icon: "view" },
];

const NAV_GESTION = [
  { href: "/platform/materiales", label: "Materiales", icon: "box" },
  { href: "/platform/planilla", label: "Planilla", icon: "clipboard" },
  { href: "/platform/servicios", label: "Costos varios", icon: "dollar" },
  { href: "/platform/equipo", label: "Equipo", icon: "users" },
];

function NavIcon({ icon }: { icon: string }) {
  const className = "h-5 w-5 shrink-0";
  switch (icon) {
    case "grid":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "view":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case "box":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "clipboard":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case "dollar":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "users":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export function PlatformShell({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // El contenido de la barra lateral (logo + opciones) es idéntico en desktop y móvil
  const sidebarContent = (
    <>
      <div className="flex flex-col items-center gap-4 py-6 border-b border-white/5 mx-4 mb-4 pb-6 relative">
        <Link 
          href="/platform/proyectos" 
          className="block platform-sidebar-logo"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Image
            src="/obri.png"
            alt="obrit"
            width={168}
            height={168}
            className="h-10 w-auto object-contain"
          />
        </Link>
        {/* Botón de cerrar solo visible en mobile modal */}
        <button 
          className="md:hidden absolute right-0 top-6 text-[var(--text2)] hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
        <span className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text3)" }}>
          Principal
        </span>
        {NAV_MAIN.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-[var(--sidebar-hover)] text-[var(--accent)] font-semibold"
                  : "text-[var(--text2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--accent)]"
              }`}
            >
              <NavIcon icon={item.icon} />
              {item.label}
            </Link>
          );
        })}
        <span className="mt-6 px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text3)" }}>
          Gestión de Recursos
        </span>
        {NAV_GESTION.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[var(--sidebar-hover)] text-[var(--accent)] font-semibold"
                    : "text-[var(--text2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--accent)]"
                }`}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {/* 1) Desktop Sidebar (invisible en mobile) */}
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col sticky top-0 h-screen overflow-y-auto"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* 2) Mobile Sidebar Overlay (invisible en desktop) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
            aria-hidden="true"
          />
          {/* Drawer Menu */}
          <aside
            className="relative flex w-[280px] max-w-[80vw] shrink-0 flex-col shadow-2xl h-full animate-in slide-in-from-left-4 duration-300"
            style={{
              background: "var(--sidebar-bg)",
              borderRight: "1px solid var(--sidebar-border)",
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* 3) Main Content Zone */}
      <div className="flex flex-1 flex-col w-full max-w-full">
        <PlatformTopbar 
          userName={getUserName(session?.user)} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        <main
          className="flex-1 p-4 md:p-8 w-full"
          style={{ background: "var(--bg2)", color: "var(--text)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
