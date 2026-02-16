"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-mono font-semibold text-foreground">Something went wrong</h1>
      <p className="text-muted-foreground mt-2 text-center max-w-md">
        We couldn’t complete your request. Please try again.
      </p>
      <Button onClick={reset} className="mt-6 font-mono">
        Try again
      </Button>
    </div>
  );
}
