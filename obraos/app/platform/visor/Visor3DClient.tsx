"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { parsePartes3D, PARTES_3D, type ParteId } from "./lib/partes3d";
import { PanelDerechoVisor } from "./PanelDerechoVisor";
import { EditorDiseñoButton } from "./EditorDiseñoButton";

export type FaseVisor = {
  id: string;
  nombre: string;
  pctAvance: number;
  status: string;
  orden?: number;
  fechaInicio?: string | Date | null;
  fechaFin?: string | Date | null;
  partes3D: unknown;
  materiales?: { id: string; cantidadRequerida: number; pctEjecutado: number; material: { id: string; nombre: string; unidad: string; costoUnitario: number; stockTotal: number } }[];
  servicios?: { id: string; cantidadRequerida: number; servicio: { id: string; nombre: string; unidad: string; costoUnitario: number } }[];
  planillasAsignadas?: { id: string; monto: number; planilla: { nombre: string } }[];
  tareas?: { id: string; nombre: string; orden: number; completadas: { unidadId: string }[] }[];
};

type Unidad = {
  id: string;
  numero: number;
  etiqueta: string;
  faseActualId?: string | null;
  modeloCasaId?: string | null;
  modeloCasa?: unknown;
};

export function Visor3DClient({
  proyectoId,
  fases,
  unidades = [],
  numUnidadesMax = 0,
  presupuestoTotal = null,
  presupuestoObraDirecta = null,
  costoComprometido = 0,
  puedeBorrarUnidades = false,
}: {
  proyectoId?: string | null;
  fases: FaseVisor[];
  unidades?: Unidad[];
  numUnidadesMax?: number;
  presupuestoTotal?: number | null;
  presupuestoObraDirecta?: number | null;
  costoComprometido?: number;
  puedeBorrarUnidades?: boolean;
}) {
  const router = useRouter();
  const [unidadActivaIdx, setUnidadActivaIdx] = useState(0);
  const [faseActivaIdxLocal, setFaseActivaIdxLocal] = useState(0);
  const [vistaDisenoCompleto, setVistaDisenoCompleto] = useState(true);

  const faseActivaIdxByUnidad = unidades.map((u) =>
    fases.findIndex((f) => f.id === u.faseActualId)
  );
  const faseActivaIdx =
    unidades.length > 0 && unidades[unidadActivaIdx]
      ? (faseActivaIdxByUnidad[unidadActivaIdx] >= 0 ? faseActivaIdxByUnidad[unidadActivaIdx] : 0)
      : faseActivaIdxLocal;

  useEffect(() => {
    const h = () => router.refresh();
    window.addEventListener("unidad-updated", h);
    return () => window.removeEventListener("unidad-updated", h);
  }, [router]);
  const partes = fases[faseActivaIdx]
    ? parsePartes3D(fases[faseActivaIdx].partes3D)
    : [];
  const visibleParts: ParteId[] = vistaDisenoCompleto
    ? [...PARTES_3D]
    : partes.length > 0
      ? partes
      : ["foundation"];

  return (
    <div className="flex h-full">
      <div className="relative min-w-0 flex-1">
      <Suspense
        fallback={
          <div
            className="flex h-full items-center justify-center"
            style={{ background: "var(--bg3)" }}
          >
            <span style={{ color: "var(--text3)" }}>Cargando visor 3D…</span>
          </div>
        }
      >
        <Canvas
          camera={{ position: [12, 8, 12], fov: 45 }}
          gl={{ antialias: true }}
          style={{ background: "#0d1117" }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-8, 5, -8]} intensity={0.4} />
          <Grid
            args={[30, 30]}
            cellColor="#1e2530"
            sectionColor="#1e2530"
            fadeDistance={50}
            infiniteGrid
          />
          <House3D visibleParts={visibleParts} />
          <OrbitControls
            enablePan
            minDistance={6}
            maxDistance={35}
            target={[0, 3, 0]}
          />
        </Canvas>
      </Suspense>

      <div
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg border p-2 backdrop-blur-sm"
        style={{
          background: "rgba(10,12,15,0.85)",
          borderColor: "var(--border)",
        }}
      >
        {proyectoId && (
          <>
            <button
              type="button"
              onClick={() => setVistaDisenoCompleto((v) => !v)}
              className="rounded px-3 py-1.5 text-[11px] font-semibold transition"
              style={{
                background: vistaDisenoCompleto ? "var(--accent)" : "var(--bg3)",
                color: vistaDisenoCompleto ? "#000" : "var(--text2)",
                border: `1px solid ${vistaDisenoCompleto ? "var(--accent)" : "var(--border2)"}`,
              }}
              title={vistaDisenoCompleto ? "Mostrando diseño completo. Clic para ver avance por fase." : "Mostrando avance por fase. Clic para ver diseño completo."}
            >
              {vistaDisenoCompleto ? "Diseño completo" : "Por fase"}
            </button>
            <EditorDiseñoButton unidades={unidades} />
          </>
        )}
        {(["3D", "Frente", "Planta", "Lateral"] as const).map((v, i) => (
          <button
            key={v}
            className="rounded px-3 py-1.5 text-[11px] font-semibold transition"
            style={{
              background: i === 0 ? "var(--accent)" : "var(--bg3)",
              color: i === 0 ? "#000" : "var(--text2)",
              border: `1px solid ${i === 0 ? "var(--accent)" : "var(--border2)"}`,
            }}
          >
            {v}
          </button>
        ))}
      </div>

      </div>

      {proyectoId && (
        <PanelDerechoVisor
          proyectoId={proyectoId}
          fases={fases}
          unidades={unidades}
          presupuestoTotal={presupuestoTotal}
          presupuestoObraDirecta={presupuestoObraDirecta}
          costoComprometido={costoComprometido}
          numUnidadesMax={numUnidadesMax}
          unidadActivaIdx={unidadActivaIdx}
          faseActivaIdx={faseActivaIdx}
          onUnidadChange={setUnidadActivaIdx}
          puedeBorrarUnidades={puedeBorrarUnidades}
          onFaseActivaChange={(idx) => {
            if (unidades.length > 0) {
              const u = unidades[unidadActivaIdx];
              if (u && fases[idx]) {
                fetch(`/api/unidades/${u.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ faseActualId: fases[idx].id }),
                }).then(() => window.dispatchEvent(new Event("unidad-updated")));
              }
            } else {
              setFaseActivaIdxLocal(idx);
            }
          }}
        />
      )}
    </div>
  );
}

function House3D({ visibleParts }: { visibleParts: ParteId[] }) {
  const setVisible = (name: ParteId) => visibleParts.includes(name);

  const COLORS: Record<ParteId, number> = {
    foundation: 0x7f6e5d,
    columns: 0x9aadbe,
    slab: 0xb0bec5,
    walls: 0xd4b896,
    pipes: 0x4fc3f7,
    facade: 0xe8c99a,
    windows: 0x80deea,
    roof: 0x8d6e63,
    door: 0x5d4037,
    details: 0xffffff,
  };

  const T = 0.3;
  const BASE = 0.95;
  const WH = 5;
  const HW = 5;
  const HD = 4;
  const Zf = HD;
  const Zb = -HD;
  const Xr = HW;
  const Xl = -HW;

  const box = (w: number, h: number, d: number, col: number, x: number, y: number, z: number) => (
    <mesh castShadow receiveShadow position={[x, y, z]}>
      <boxGeometry args={[w, h, d]} />
      <meshLambertMaterial color={col} />
    </mesh>
  );

  return (
    <group position={[0, 0, 0]}>
      {setVisible("foundation") && (
        <group name="foundation">
          {box(HW * 2, 0.5, HD * 2, COLORS.foundation, 0, 0.25, 0)}
        </group>
      )}

      {setVisible("columns") && (
        <group name="columns">
          {[
            [Xl + T / 2, BASE + WH / 2, Zf - T / 2],
            [Xr - T / 2, BASE + WH / 2, Zf - T / 2],
            [Xl + T / 2, BASE + WH / 2, Zb + T / 2],
            [Xr - T / 2, BASE + WH / 2, Zb + T / 2],
          ].map(([x, y, z], i) => (
            <mesh key={i} castShadow receiveShadow position={[x, y, z]}>
              <boxGeometry args={[0.26, WH, 0.26]} />
              <meshLambertMaterial color={COLORS.columns} />
            </mesh>
          ))}
        </group>
      )}

      {setVisible("slab") && (
        <group name="slab">
          {box(HW * 2, 0.22, HD * 2, COLORS.slab, 0, BASE + WH + 0.26, 0)}
        </group>
      )}

      {setVisible("walls") && (
        <group name="walls">
          {box(HW * 2, 2.85, T, COLORS.walls, 0, BASE + 2.5, Zf)}
          {box(HW * 2, 2.85, T, COLORS.walls, 0, BASE + 2.5, Zb)}
          {box(T, 2.85, HD * 2, COLORS.walls, Xl, BASE + 2.5, 0)}
          {box(T, 2.85, HD * 2, COLORS.walls, Xr, BASE + 2.5, 0)}
        </group>
      )}

      {setVisible("pipes") && (
        <group name="pipes">
          <mesh castShadow receiveShadow position={[1.5, BASE + 1.5, Zf - 0.5]}>
            <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
            <meshLambertMaterial color={COLORS.pipes} />
          </mesh>
          <mesh castShadow receiveShadow position={[-1.5, BASE + 1.5, Zb + 0.5]}>
            <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
            <meshLambertMaterial color={COLORS.pipes} />
          </mesh>
        </group>
      )}

      {setVisible("facade") && (
        <group name="facade">
          {box(HW * 2 - 0.2, 0.15, T + 0.05, COLORS.facade, 0, BASE + 2.9, Zf + 0.02)}
          {box(HW * 2 - 0.2, 0.15, T + 0.05, COLORS.facade, 0, BASE + 2.1, Zf + 0.02)}
        </group>
      )}

      {setVisible("roof") && (
        <group name="roof">
          <mesh
            castShadow
            receiveShadow
            position={[0, BASE + WH + 1.6, 0]}
            rotation={[0, Math.PI / 4, 0]}
          >
            <coneGeometry args={[7.6, 2.9, 4]} />
            <meshLambertMaterial color={COLORS.roof} />
          </mesh>
        </group>
      )}

      {setVisible("door") && (
        <group name="door">
          {box(1.35, 2.25, 0.06, COLORS.door, 0, BASE + 1.35, Zf + 0.04)}
        </group>
      )}

      {setVisible("windows") && (
        <group name="windows">
          {box(1.35, 1.38, 0.05, COLORS.windows, -2.75, BASE + 2.1, Zf + 0.02)}
          {box(1.35, 1.38, 0.05, COLORS.windows, 2.75, BASE + 2.1, Zf + 0.02)}
        </group>
      )}

      {setVisible("details") && (
        <group name="details">
          <mesh castShadow receiveShadow position={[0, BASE + 0.2, Zf + 0.6]}>
            <boxGeometry args={[1.5, 0.15, 0.8]} />
            <meshLambertMaterial color={COLORS.details} />
          </mesh>
        </group>
      )}
    </group>
  );
}
