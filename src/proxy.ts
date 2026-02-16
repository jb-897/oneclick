import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith("/admin/login");

  if (isAdminRoute && !isAdminLogin) {
    const session = await getSessionFromRequest(req);
    if (!session) {
      const login = new URL("/admin/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return Response.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
