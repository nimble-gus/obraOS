"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type UserAvatarMenuProps = {
  userName?: string;
  /** "platform" = muestra "Ir a Admin"; "admin" = muestra "Ir a Plataforma" */
  variant: "platform" | "admin";
};

export function UserAvatarMenu({ userName, variant }: UserAvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const linkClass =
    "block w-full px-4 py-2.5 text-left text-sm transition hover:bg-[var(--sidebar-hover)]";
  const linkStyle = { color: "var(--text)" };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition hover:opacity-90"
        style={{
          background: "var(--accent)",
          color: "#000",
        }}
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        {userName?.slice(0, 2).toUpperCase() ?? "U"}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border py-1 shadow-lg"
          style={{
            background: "var(--bg2)",
            borderColor: "var(--border)",
          }}
        >
          <Link
            href="/platform/perfil"
            className={linkClass}
            style={linkStyle}
            onClick={() => setOpen(false)}
          >
            Mi perfil
          </Link>
          {variant === "platform" ? (
            <Link
              href="/admin"
              className={linkClass}
              style={linkStyle}
              onClick={() => setOpen(false)}
            >
              Ir a portal de Admin
            </Link>
          ) : (
            <Link
              href="/platform/proyectos"
              className={linkClass}
              style={linkStyle}
              onClick={() => setOpen(false)}
            >
              Ir a Plataforma
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className={`${linkClass} w-full border-t`}
            style={{ ...linkStyle, borderColor: "var(--border)" }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
