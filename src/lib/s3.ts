import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || "";
const B2_ENDPOINT = process.env.B2_ENDPOINT || "https://s3.us-west-004.backblazeb2.com";
const B2_REGION = process.env.B2_REGION || "us-west-004";

export function isB2Configured(): boolean {
  return Boolean(
    B2_KEY_ID &&
      B2_APPLICATION_KEY &&
      B2_BUCKET_NAME &&
      !B2_KEY_ID.includes("your_") &&
      !B2_APPLICATION_KEY.includes("your_")
  );
}

export const s3Client = new S3Client({
  region: B2_REGION,
  endpoint: B2_ENDPOINT,
  credentials: {
    accessKeyId: B2_KEY_ID || "",
    secretAccessKey: B2_APPLICATION_KEY || "",
  },
  forcePathStyle: true, // required for Backblaze B2 S3-compatible API
});

/**
 * Generate S3 PUT Presigned URL for direct client-to-B2 upload
 */
export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  if (!isB2Configured()) {
    throw new Error("Backblaze B2 is not configured. Please set B2 credentials in environment.");
  }

  const command = new PutObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  
  // Public or accessible B2 URL format
  const cleanEndpoint = B2_ENDPOINT.replace(/\/+$/, "");
  const b2Url = `${cleanEndpoint}/${B2_BUCKET_NAME}/${key}`;

  return {
    uploadUrl,
    b2Url,
    b2Key: key,
  };
}

/**
 * Generate S3 GET Presigned URL with Content-Disposition: attachment for downloads
 */
export async function getPresignedDownloadUrl(
  key: string,
  filename?: string,
  expiresIn = 3600
) {
  if (!isB2Configured()) {
    return null;
  }

  const safeFilename = filename ? filename.replace(/["\r\n]/g, "") : "download";
  const encodedFilename = filename ? encodeURIComponent(filename) : "download";

  const command = new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate S3 GET Presigned URL for viewing/streaming media with byte-range support
 */
export async function getPresignedViewUrl(
  key: string,
  contentType?: string,
  expiresIn = 86400
) {
  if (!isB2Configured()) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    ResponseContentType: contentType || undefined,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a single object from Backblaze B2
 */
export async function deleteB2Object(key: string) {
  if (!isB2Configured() || !key) return;
  try {
    const command = new DeleteObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  } catch (err) {
    console.error(`Error deleting object ${key} from B2:`, err);
  }
}

/**
 * Delete multiple objects from Backblaze B2
 */
export async function deleteB2Objects(keys: string[]) {
  const validKeys = keys.filter(Boolean);
  if (!isB2Configured() || validKeys.length === 0) return;

  try {
    const command = new DeleteObjectsCommand({
      Bucket: B2_BUCKET_NAME,
      Delete: {
        Objects: validKeys.map((Key) => ({ Key })),
        Quiet: true,
      },
    });
    await s3Client.send(command);
  } catch (err) {
    console.error(`Error batch deleting ${validKeys.length} objects from B2:`, err);
  }
}
