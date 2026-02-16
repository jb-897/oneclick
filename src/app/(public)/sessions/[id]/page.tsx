import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await prisma.eventSession.findFirst({
    where: { id, cancelledAt: null },
  });
  if (!session) notFound();

  const confirmedCount = await prisma.registration.count({
    where: { sessionId: id, status: "CONFIRMED" },
  });
  const spotsLeft = Math.max(0, session.totalSpots - confirmedCount);
  const isOpen =
    !session.cancelledAt &&
    session.registrationOpen &&
    spotsLeft > 0;
  const status = session.cancelledAt
    ? "Cancelled"
    : !session.registrationOpen
      ? "Registration closed"
      : spotsLeft === 0
        ? "Full"
        : "Open";

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/sessions" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
        ← Back to sessions
      </Link>
      <Card className="max-w-2xl border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-2xl font-mono font-semibold">{session.place}</h1>
            <Badge variant={isOpen ? "default" : "secondary"} className="font-mono">
              {status}
            </Badge>
          </div>
          <time className="font-mono text-muted-foreground mt-2">
            {new Date(session.date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            at {session.startTime}
          </time>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <span className="text-muted-foreground">Duration:</span>{" "}
            {session.durationMinutes} minutes
          </p>
          <p>
            <span className="text-muted-foreground">Spots:</span> {spotsLeft} left of{" "}
            {session.totalSpots}
          </p>
          {session.utilities?.length > 0 && (
            <p>
              <span className="text-muted-foreground">Bring:</span>{" "}
              {session.utilities.join(", ")}
            </p>
          )}
          {session.description && (
            <p className="text-muted-foreground pt-2">{session.description}</p>
          )}
          {session.level && (
            <p>
              <span className="text-muted-foreground">Level:</span> {session.level}
            </p>
          )}
          <div className="pt-4">
            <Button asChild size="lg" className="font-mono" disabled={!isOpen}>
              <Link href={isOpen ? `/register/${session.id}` : "#"}>
                {isOpen ? "Register" : "Registration closed"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
