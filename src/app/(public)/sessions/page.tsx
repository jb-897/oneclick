import { eq, asc } from "drizzle-orm";
import { count } from "drizzle-orm";
import { isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions, registrations } from "@/db/schema";
import { REGISTRATION_STATUS } from "@/db/schema";
import { SessionCard } from "@/components/public/SessionCard";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const [sessions, confirmedRows] = await Promise.all([
    db
      .select()
      .from(eventSessions)
      .where(isNull(eventSessions.cancelledAt))
      .orderBy(asc(eventSessions.date), asc(eventSessions.startTime)),
    db
      .select({
        sessionId: registrations.sessionId,
        count: count(),
      })
      .from(registrations)
      .where(eq(registrations.status, REGISTRATION_STATUS.CONFIRMED))
      .groupBy(registrations.sessionId),
  ]);

  const confirmedBySession = new Map(
    confirmedRows.map((r) => [r.sessionId, Number(r.count)])
  );
  const withConfirmed = sessions.map((s) => ({
    ...s,
    confirmedCount: confirmedBySession.get(s.id) ?? 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-mono font-semibold text-foreground mb-2">Sessions</h1>
      <p className="text-muted-foreground mb-8">Upcoming Vibe Coding sessions in digital health and medical web applications. Explore dates and register.</p>
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
