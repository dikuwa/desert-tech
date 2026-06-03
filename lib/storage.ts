/**
 * File storage abstraction layer.
 *
 * In production, this uploads to Cloudflare R2.
 * In development without R2 credentials, files are stored as Base64
 * in memory or served directly from the generation endpoint.
 */

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file buffer to storage.
 * Falls back to a data URL when R2 is not configured.
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<UploadResult> {
  const r2Endpoint = process.env.R2_ENDPOINT;
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.R2_BUCKET_NAME;

  if (r2Endpoint && r2AccessKey && r2SecretKey && r2Bucket) {
    return uploadToR2(buffer, filename, contentType);
  }

  // Fallback: return a data URL for development
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${contentType};base64,${base64}`;
  return { url: dataUrl, key: filename };
}

async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<UploadResult> {
  // R2 upload uses the S3-compatible API
  const { S3Client, PutObjectCommand } = await import(
    "@aws-sdk/client-s3"
  );

  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const key = `receipts/${filename}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${key}`
    : `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${key}`;

  return { url: publicUrl, key };
}
