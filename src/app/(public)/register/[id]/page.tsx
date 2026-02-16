import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions, registrations } from "@/db/schema";
import { REGISTRATION_STATUS } from "@/db/schema";
import { RegistrationForm } from "@/components/public/RegistrationForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session] = await db
    .select()
    .from(eventSessions)
    .where(and(eq(eventSessions.id, id), isNull(eventSessions.cancelledAt)))
    .limit(1);
  if (!session) notFound();

  const confirmedCount = await db.$count(registrations, and(
    eq(registrations.sessionId, id),
    eq(registrations.status, REGISTRATION_STATUS.CONFIRMED)
  ));
  const spotsLeft = Math.max(0, session.totalSpots - confirmedCount);
  const canRegister =
    !session.cancelledAt && session.registrationOpen && spotsLeft > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/sessions/${id}`} className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
        ← Back to session
      </Link>
      <h1 className="text-2xl font-mono font-semibold mb-2">Register</h1>
      <p className="text-muted-foreground mb-6">
        {session.place} — {new Date(session.date).toLocaleDateString("en-GB", { dateStyle: "long" })} at {session.startTime}
      </p>
      {canRegister ? (
        <RegistrationForm sessionId={id} />
      ) : (
        <p className="text-muted-foreground">Registration is not open for this session.</p>
      )}
    </div>
  );
}
