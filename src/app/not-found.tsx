import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-mono font-semibold text-foreground">404</h1>
      <p className="text-muted-foreground mt-2">This page could not be found.</p>
      <Button asChild className="mt-6 font-mono">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
