import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions } from "@/db/schema";
import { SessionForm } from "@/components/admin/SessionForm";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session] = await db
    .select()
    .from(eventSessions)
    .where(eq(eventSessions.id, id))
    .limit(1);
  if (!session || session.cancelledAt) notFound();

  const dateStr =
    typeof session.date === "string"
      ? session.date.slice(0, 10)
      : String(session.date).slice(0, 10);
  const defaultValues = {
    date: dateStr,
    startTime: session.startTime,
    durationMinutes: session.durationMinutes,
    place: session.place,
    totalSpots: session.totalSpots,
    utilities: session.utilities?.length ? session.utilities.join(", ") : "",
    description: session.description ?? "",
    level: session.level ?? "",
    tags: session.tags?.length ? session.tags.join(", ") : "",
    registrationOpen: session.registrationOpen,
  };

  return (
    <div className="space-y-6">
      <Link href={`/admin/sessions/${id}`} className="text-sm text-muted-foreground hover:text-foreground inline-block">
        ← Session detail
      </Link>
      <h1 className="text-2xl font-mono font-semibold">Edit session</h1>
      <SessionForm sessionId={id} defaultValues={defaultValues} />
    </div>
  );
}
