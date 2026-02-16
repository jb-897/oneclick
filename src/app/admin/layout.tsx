import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return (
    <div className="min-h-screen bg-background">
      {session ? (
        <>
          <header className="border-b border-border bg-card/50 sticky top-0 z-10">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <nav className="flex items-center gap-6">
                <Link href="/admin" className="font-mono font-medium text-primary">
                  Vibe Coding Admin
                </Link>
                <Link href="/admin/sessions" className="text-sm text-muted-foreground hover:text-foreground">
                  Sessions
                </Link>
              </nav>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{session.email}</span>
                <SignOutButton />
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">{children}</main>
        </>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}
