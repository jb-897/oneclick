import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export interface AdminSession {
  email: string;
}

export const SESSION_OPTIONS = {
  cookieName: "vibe_admin_session",
  password: process.env.IRON_SECRET!,
  ttl: 30 * 24 * 60 * 60, // 30 days in seconds
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

/** Use in proxy: get session from request cookies (read-only). */
export async function getSessionFromRequest(request: NextRequest): Promise<AdminSession | null> {
  const cookieStore = {
    get: (name: string) => {
      const c = request.cookies.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (_a: string | { name?: string; value?: string }, _b?: string, _c?: unknown) => {},
  };
  // Proxy only reads session; cookieStore.set is a no-op. Cast needed for iron-session CookieStore overload.
  const session = await getIronSession<AdminSession>(cookieStore as any, SESSION_OPTIONS);
  if (!session.email) return null;
  return session;
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, SESSION_OPTIONS);
  if (!session.email) return null;
  return session;
}

export async function setSession(email: string): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, SESSION_OPTIONS);
  session.email = email;
  await session.save();
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, SESSION_OPTIONS);
  session.destroy();
}

export async function requireAdmin(): Promise<AdminSession | null> {
  const session = await getSession();
  return session;
}
