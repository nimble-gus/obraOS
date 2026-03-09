import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPublicUrl, uploadObject, getObject } from "@/lib/s3";
import { puedeConfigurarModeloFinanciero } from "@/lib/permissions";

/**
 * POST: Subir imagen del proyecto desde el cliente.
 * Solo ADMIN puede subir.
 * Espera FormData con campo "file".
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeConfigurarModeloFinanciero(session.user.role ?? "")) {
    return NextResponse.json({ error: "Solo administradores pueden subir imágenes" }, { status: 403 });
  }

  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Se requiere un archivo "file"' }, { status: 400 });
  }

  const contentType = file.type || "application/octet-stream";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "El archivo debe ser una imagen (image/jpeg, image/png, etc.)" },
      { status: 400 }
    );
  }

  const proyectoExistente = await prisma.proyecto.findUnique({ where: { id } });
  if (!proyectoExistente) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const key = `proyectos/${id}/imagen.${ext}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await uploadObject(key, buffer, contentType);
  } catch (e) {
    console.error("S3 upload error:", e);
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
  }

  const publicUrl = getPublicUrl(key);
  const proyectoActualizado = await prisma.proyecto.update({
    where: { id },
    // Guardamos el key interno; la URL pública se construye/proxyea desde el backend.
    data: { imagenUrl: key },
  });

  return NextResponse.json({ publicUrl, key, proyecto: proyectoActualizado });
}

/**
 * GET: Servir imagen del proyecto desde el bucket (proxy).
 * Mantiene el bucket privado y evita problemas de CORS.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    select: { imagenUrl: true },
  });

  if (!proyecto?.imagenUrl) {
    return new Response(null, { status: 404 });
  }

  let key = proyecto.imagenUrl;

  // Compatibilidad con valores antiguos donde se guardaba la URL completa
  if (key.startsWith("http")) {
    try {
      const url = new URL(key);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        // Quitamos el segmento del bucket: /<bucket>/<key...>
        key = parts.slice(1).join("/");
      }
    } catch {
      // Si falla el parse, usamos el valor tal cual
    }
  }

  try {
    const obj = await getObject(key);
    const body = obj.Body as any;
    const contentType =
      // @ts-ignore - ContentType existe en la respuesta de GetObjectCommand
      obj.ContentType || "application/octet-stream";

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("S3 getObject error:", e);
    return new Response(null, { status: 500 });
  }
}
