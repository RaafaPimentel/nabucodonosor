import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEYLEN = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, storedHash] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const computed = scryptSync(password, salt, KEYLEN);
  const existing = Buffer.from(storedHash, "hex");
  if (computed.length !== existing.length) {
    return false;
  }

  return timingSafeEqual(computed, existing);
}
