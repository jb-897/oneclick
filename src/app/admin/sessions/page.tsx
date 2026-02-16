import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const [sessions, confirmedBySession] = await Promise.all([
    prisma.eventSession.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.registration
      .groupBy({
        by: ["sessionId"],
        _count: { id: true },
        where: { status: "CONFIRMED" },
      })
      .then((rows) => new Map(rows.map((r) => [r.sessionId, r._count.id]))),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-semibold">Sessions</h1>
        <Button asChild className="font-mono">
          <Link href="/admin/sessions/new">New session</Link>
        </Button>
      </div>
      {sessions.length === 0 ? (
        <p className="text-muted-foreground">No sessions yet.</p>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => {
            const confirmed = confirmedBySession.get(s.id) ?? 0;
            const spotsLeft = Math.max(0, s.totalSpots - confirmed);
            const isCancelled = !!s.cancelledAt;
            return (
              <Card key={s.id} className={isCancelled ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Link
                      href={`/admin/sessions/${s.id}`}
                      className="font-mono font-semibold text-primary hover:underline"
                    >
                      {s.place}
                    </Link>
                    <div className="flex items-center gap-2">
                      {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
                      {!s.registrationOpen && !isCancelled && (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                      <Badge variant="outline" className="font-mono">
                        {confirmed}/{s.totalSpots}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(s.date).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at {s.startTime} · {s.durationMinutes} min
                  </p>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/sessions/${s.id}`}>View</Link>
                  </Button>
                  {!isCancelled && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/sessions/${s.id}/edit`}>Edit</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
