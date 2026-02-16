import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-edge";

export default auth((req) => {
  // #region agent log
  fetch("http://127.0.0.1:7244/ingest/16d87d14-6f6d-46d3-a771-f71daf70004d", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "proxy.ts",
      message: "proxy ran",
      data: { pathname: req.nextUrl.pathname, hasAuth: !!req.auth },
      timestamp: Date.now(),
      hypothesisId: "edge-bundle",
    }),
  }).catch(() => {});
  // #endregion
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
