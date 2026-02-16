import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";

export const dynamic = "force-dynamic";

export default async function AdminSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await prisma.eventSession.findUnique({
    where: { id },
  });
  if (!session) notFound();

  const registrations = await prisma.registration.findMany({
    where: { sessionId: id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  const confirmed = registrations.filter((r) => r.status === "CONFIRMED");
  const pending = registrations.filter((r) => r.status === "PENDING_CONFIRMATION");
  const cancelled = registrations.filter((r) => r.status === "CANCELLED");
  const spotsLeft = Math.max(0, session.totalSpots - confirmed.length);
  const isCancelled = !!session.cancelledAt;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/sessions" className="text-sm text-muted-foreground hover:text-foreground inline-block mb-4">
          ← Sessions
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-mono font-semibold">{session.place}</h1>
          <div className="flex items-center gap-2">
            {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
            {!session.registrationOpen && !isCancelled && (
              <Badge variant="secondary">Registration closed</Badge>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/sessions/${id}/edit`}>Edit</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`/api/admin/sessions/${id}/participants?format=csv`} download>
                Export CSV
              </a>
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          {new Date(session.date).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          at {session.startTime} · {session.durationMinutes} min · {confirmed.length}/{session.totalSpots} confirmed
          {spotsLeft > 0 && ` · ${spotsLeft} spots left`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-mono">Participants</CardTitle>
          <CardDescription>
            Confirmed: {confirmed.length} · Pending: {pending.length}
            {cancelled.length > 0 && ` · Cancelled: ${cancelled.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParticipantsTable
            confirmed={confirmed}
            pending={pending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

