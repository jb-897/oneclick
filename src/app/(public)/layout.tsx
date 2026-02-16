import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/30 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-mono font-semibold text-primary">
            Vibe Coding
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/sessions" className="text-sm text-muted-foreground hover:text-foreground">
              Sessions
            </Link>
            <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Vibe Coding Classes — Register for workshops and level up.
        </div>
      </footer>
    </div>
  );
}
