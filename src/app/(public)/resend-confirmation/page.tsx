"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResendConfirmationPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(res.ok ? "success" : "error");
    } catch {
      setMessage("error");
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="max-w-md w-full border-primary/20">
        <CardHeader>
          <CardTitle className="font-mono text-xl">Resend confirmation</CardTitle>
          <CardDescription>
            Enter the session ID and email you used to register. If you have a pending registration, we’ll send a new link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="From the session URL"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="font-mono"
                required
              />
            </div>
            {message === "success" && (
              <p className="text-sm text-primary">If you have a pending registration, check your email for a new link.</p>
            )}
            {message === "error" && (
              <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
            )}
            <Button type="submit" className="w-full font-mono" disabled={loading}>
              {loading ? "Sending…" : "Send new link"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <button type="button" onClick={() => router.push("/sessions")} className="underline hover:text-foreground">
              Back to sessions
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
