/**
 * Minimal NextAuth config for Edge (middleware) only.
 * Do NOT add Prisma, Credentials, or other server-only deps here—
 * they would be bundled into the Edge function and exceed size limits.
 */
import NextAuth from "next-auth";

export const { auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: "ADMIN" }).role;
        token.sub = (user as { id?: string }).id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        (session.user as { role?: "ADMIN" }).role = (token.role as "ADMIN") ?? "ADMIN";
      }
      return session;
    },
  },
});
