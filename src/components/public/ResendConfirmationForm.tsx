"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ResendSessionOption = {
  id: string;
  place: string;
  date: string; // ISO-like (YYYY-MM-DD) from db
  startTime: string;
};

function formatSessionLabel(s: ResendSessionOption): string {
  const d = new Date(s.date);
  const dateStr = isNaN(d.getTime())
    ? s.date
    : d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  return `${dateStr} · ${s.startTime} — ${s.place}`;
}

export function ResendConfirmationForm({ sessions }: { sessions: ResendSessionOption[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);

  const sessionItems = useMemo(
    () =>
      sessions.map((s) => ({
        value: s.id,
        label: formatSessionLabel(s),
      })),
    [sessions]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sessionId }),
      });
      await res.json().catch(() => ({}));
      setMessage(res.ok ? "success" : "error");
    } catch {
      setMessage("error");
    }
    setLoading(false);
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="font-mono text-xl">Resend confirmation</CardTitle>
        <CardDescription>
          Enter your email and choose the session you registered for. If you have a pending registration, we’ll send a new link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label>Session</Label>
            <Select value={sessionId} onValueChange={setSessionId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an upcoming session" />
              </SelectTrigger>
              <SelectContent>
                {sessionItems.map((it) => (
                  <SelectItem key={it.value} value={it.value}>
                    {it.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {message === "success" && (
            <p className="text-sm text-primary">
              If you have a pending registration, check your email for a new link.
            </p>
          )}
          {message === "error" && (
            <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
          )}

          <Button type="submit" className="w-full font-mono" disabled={loading || !sessionId}>
            {loading ? "Sending…" : "Send new link"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => router.push("/sessions")}
            className="underline hover:text-foreground"
          >
            Back to sessions
          </button>
        </p>
      </CardContent>
    </>
  );
}

