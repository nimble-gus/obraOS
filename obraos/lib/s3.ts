import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Normalizamos el endpoint: Tigris/T3 recomienda usar t3.storage.dev.
// Si viene con "t3.storageapi.dev" desde Railway/T3 UI, lo convertimos.
const rawEndpoint = process.env.S3_ENDPOINT;
const S3_ENDPOINT = rawEndpoint?.includes("t3.storageapi.dev")
  ? rawEndpoint.replace("t3.storageapi.dev", "t3.storage.dev")
  : rawEndpoint;
const S3_REGION = process.env.S3_REGION || "auto";
const S3_BUCKET = process.env.S3_BUCKET;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET = process.env.S3_SECRET_ACCESS_KEY;

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET) {
      throw new Error("S3 credentials missing: S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY");
    }
    s3Client = new S3Client({
      region: S3_REGION,
      endpoint: S3_ENDPOINT,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET,
      },
      forcePathStyle: false,
    });
  }
  return s3Client;
}

/**
 * Genera una URL firmada para subir un archivo a S3.
 * @param key Ruta del objeto en el bucket (ej: "proyectos/abc123/imagen.jpg")
 * @param contentType MIME type (ej: "image/jpeg")
 * @param expiresIn Segundos de validez (default 300 = 5 min)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Construye la URL pública de un objeto subido.
 * Para S3-compatible con URL pública: endpoint/bucket/key
 */
export function getPublicUrl(key: string): string {
  if (!S3_ENDPOINT || !S3_BUCKET) {
    throw new Error("S3_ENDPOINT and S3_BUCKET required");
  }
  const base = S3_ENDPOINT.replace(/\/$/, "");
  return `${base}/${S3_BUCKET}/${key}`;
}

/**
 * Sube un objeto directamente al bucket (uso server-side).
 */
export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Obtiene un objeto del bucket (uso server-side).
 */
export async function getObject(key: string) {
  const client = getS3Client();
  return client.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
    })
  );
}

/**
 * Elimina un objeto del bucket.
 */
export async function deleteObject(key: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET!, Key: key })
  );
}
