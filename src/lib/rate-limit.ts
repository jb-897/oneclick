/**
 * Simple in-memory rate limiter for registration and resend.
 * For production at scale, use Redis/Upstash.
 */

const windowMs = 60 * 1000; // 1 minute
const maxRegister = 5;
const maxResend = 3;

const registerCounts = new Map<string, { count: number; resetAt: number }>();
const resendCounts = new Map<string, { count: number; resetAt: number }>();

function getKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip;
}

function checkLimit(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  max: number
): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export function checkRegisterLimit(req: Request): boolean {
  return checkLimit(registerCounts, getKey(req), maxRegister);
}

export function checkResendLimit(req: Request): boolean {
  return checkLimit(resendCounts, getKey(req), maxResend);
}
