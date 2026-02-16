import { NextResponse } from "next/server";

/**
 * Legacy NextAuth paths: no longer used (auth is env-based admin + iron-session).
 * Redirect any /api/auth/* request to the current admin login so old links/callbacks don't 500.
 */
export async function GET(
  req: Request,
  _context: { params: Promise<{ nextauth: string[] }> }
) {
  const url = new URL(req.url);
  const login = new URL("/admin/login", url.origin);
  const callbackUrl = url.searchParams.get("callbackUrl");
  if (callbackUrl) login.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(login, 302);
}

export async function POST(
  req: Request,
  _context: { params: Promise<{ nextauth: string[] }> }
) {
  const url = new URL(req.url);
  const login = new URL("/admin/login", url.origin);
  const callbackUrl = url.searchParams.get("callbackUrl");
  if (callbackUrl) login.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(login, 302);
}
