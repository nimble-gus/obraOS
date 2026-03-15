import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || "auto";
const bucket = process.env.S3_BUCKET;

function getClient(): S3Client {
  if (!endpoint || !bucket) {
    throw new Error("S3_ENDPOINT and S3_BUCKET are required");
  }
  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: true,
  });
}

/**
 * Devuelve la URL del proxy para la imagen.
 * Extrae el id del proyecto del key (proyectos/{id}/imagen.xxx).
 */
export function getPublicUrl(key: string): string {
  const match = key.match(/^proyectos\/([^/]+)\//);
  if (match) return `/api/proyectos/${match[1]}/imagen`;
  return key;
}

/**
 * Sube un objeto al bucket.
 */
export async function uploadObject(
  key: string,
  body: Buffer,
  contentType?: string
): Promise<void> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Descarga un objeto del bucket.
 */
export async function getObject(key: string) {
  const client = getClient();
  return client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Elimina un objeto del bucket.
 */
export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
