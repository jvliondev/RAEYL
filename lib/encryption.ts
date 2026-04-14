/**
 * Simple AES-256-GCM encryption for storing provider secrets at rest.
 * Key is derived from ENCRYPTION_KEY env var, falling back to AUTH_SECRET.
 * Encrypted values are stored as base64 strings: iv:tag:ciphertext
 */

import crypto from "crypto";

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY ?? process.env.AUTH_SECRET ?? "";
  if (!raw) {
    throw new Error("ENCRYPTION_KEY or AUTH_SECRET must be set to encrypt provider secrets.");
  }
  // Derive a 32-byte key from whatever string is provided
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decrypt(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    // If not encrypted (legacy plain value), return as-is
    return ciphertext;
  }
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data).toString("utf8") + decipher.final("utf8");
}
