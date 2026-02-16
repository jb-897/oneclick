import { prisma } from "@/lib/prisma";
import { SessionCard } from "@/components/public/SessionCard";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const [sessions, confirmedBySession] = await Promise.all([
    prisma.eventSession.findMany({
      where: { cancelledAt: null },
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

  const withConfirmed = sessions.map((s) => ({
    ...s,
    confirmedCount: confirmedBySession.get(s.id) ?? 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-mono font-semibold text-foreground mb-2">Sessions</h1>
      <p className="text-muted-foreground mb-8">Upcoming Vibe Coding classes. Click to see details and register.</p>
      {withConfirmed.length === 0 ? (
        <p className="text-muted-foreground">No sessions yet. Check back later.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withConfirmed.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
