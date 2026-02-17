import Link from "next/link";
import Image from "next/image";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-foreground">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-black/70 border-b border-border/60">
        {/* Main nav at the very top */}
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="font-mono font-semibold text-primary whitespace-nowrap">
              Vibe Coding
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground truncate">
              <span className="truncate">
                at the Department of Medical Education & Simulation · LFUK
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/sessions" className="text-sm text-muted-foreground hover:text-foreground">
              Sessions
            </Link>
            <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 mt-auto bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-row items-center justify-center gap-5 sm:gap-8 mb-4">
            <Image
              src="/UMVAS%20logo.jpg"
              alt="UMVAS"
              width={340}
              height={100}
              className="h-12 sm:h-14 w-auto object-contain"
            />
            <Image
              src="/LFUK%20logo.png"
              alt="LFUK"
              width={130}
              height={41}
              className="w-[130px] h-[41px] object-contain opacity-95"
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
