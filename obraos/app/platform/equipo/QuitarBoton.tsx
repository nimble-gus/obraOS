"use client";

import { useRouter } from "next/navigation";

export function QuitarBoton({ pmId, pmNombre }: { pmId: string; pmNombre: string }) {
  const router = useRouter();

  async function handleQuitar() {
    if (!confirm(`¿Quitar a ${pmNombre} del equipo PM? Se cambiará su rol a Supervisor.`)) return;

    const res = await fetch(`/api/equipo/quitar/${pmId}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error ?? "Error al quitar del equipo");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleQuitar}
      className="rounded px-2 py-1 text-[10px] font-medium transition"
      style={{
        background: "rgba(239,68,68,0.1)",
        color: "var(--red)",
        border: "1px solid rgba(239,68,68,0.3)",
      }}
    >
      Quitar
    </button>
  );
}
