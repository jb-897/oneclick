import Link from "next/link";
import Image from "next/image";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-card/30">
        {/* Institutional bar */}
        <div className="border-b border-border/60 bg-background/50">
          <div className="container mx-auto px-4 h-10 flex items-center justify-between">
            <Image
              src="/umvas.svg"
              alt="Department of Medical Education & Simulation (UMVAS)"
              width={100}
              height={28}
              className="h-6 w-auto object-contain object-left"
            />
            <Image
              src="/lfuk.svg"
              alt="Faculty of Medicine (LFUK)"
              width={80}
              height={24}
              className="h-5 w-auto object-contain object-right opacity-90"
            />
          </div>
        </div>
        {/* Main nav */}
        <div className="border-b border-border">
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
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mb-4">
            <Image
              src="/umvas.svg"
              alt="UMVAS"
              width={100}
              height={28}
              className="h-7 w-auto object-contain"
            />
            <Image
              src="/lfuk.svg"
              alt="LFUK"
              width={80}
              height={24}
              className="h-6 w-auto object-contain opacity-90"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
            Organized by the Department of Medical Education & Simulation (UMVAS), Faculty of Medicine (LFUK).
          </p>
          {CONTACT_EMAIL && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
