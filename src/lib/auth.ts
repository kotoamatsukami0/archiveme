const COOKIE_NAME = "archiveme_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  return (
    process.env.APP_PASSWORD ||
    process.env.TURSO_AUTH_TOKEN ||
    "archiveme-default-secure-key"
  );
}

function strToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  const uint8 = encoder.encode(str);
  const buffer = new ArrayBuffer(uint8.byteLength);
  new Uint8Array(buffer).set(uint8);
  return buffer;
}

// Create HMAC SHA-256 signature using Web Crypto API (supported across Node, Bun, and Edge Middleware)
async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    strToArrayBuffer(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, strToArrayBuffer(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a cryptographically signed session token
 */
export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const secret = getSecret();
  const signature = await sign(timestamp, secret);
  return `${timestamp}.${signature}`;
}

/**
 * Verify a session token against current secret and max age
 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes(".")) return false;

  const [timestampStr, signature] = token.split(".");
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // Check expiration (30 days)
  const now = Date.now();
  if (now - timestamp > SESSION_MAX_AGE * 1000) {
    return false;
  }

  const secret = getSecret();
  const expectedSignature = await sign(timestampStr, secret);

  return signature === expectedSignature;
}

export { COOKIE_NAME, SESSION_MAX_AGE };
