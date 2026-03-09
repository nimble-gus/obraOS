"use client";

import Link from "next/link";

export function EquipoClient() {
  return (
    <Link
      href="/admin/usuarios/nuevo?rol=PROJECT_MANAGER"
      className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
      style={{ background: "var(--accent)" }}
    >
      + Agregar persona
    </Link>
  );
}
