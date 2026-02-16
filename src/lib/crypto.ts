import { createHash, randomBytes } from "crypto";

const TOKEN_BYTES = 32;
const HASH_ALGORITHM = "sha256";

export function generateConfirmationToken(): { raw: string; hash: string } {
  const raw = randomBytes(TOKEN_BYTES).toString("hex");
  const hash = createHash(HASH_ALGORITHM).update(raw).digest("hex");
  return { raw, hash };
}

export function hashConfirmationToken(raw: string): string {
  return createHash(HASH_ALGORITHM).update(raw).digest("hex");
}

export const CONFIRMATION_EXPIRY_HOURS = 24;

export function getConfirmationExpiry(): Date {
  const d = new Date();
  d.setHours(d.getHours() + CONFIRMATION_EXPIRY_HOURS);
  return d;
}
