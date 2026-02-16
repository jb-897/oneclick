import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith("/admin/login");
  const isAuthApi = pathname.startsWith("/api/auth");

  if (isAuthApi) return NextResponse.next();

  if (isAdminRoute && !isAdminLogin) {
    if (!req.auth) {
      const login = new URL("/admin/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return Response.redirect(login);
    }
    if (req.auth.user?.role !== "ADMIN") {
      return Response.redirect(new URL("/admin/login", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
