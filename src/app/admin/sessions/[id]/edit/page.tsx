import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SessionForm } from "@/components/admin/SessionForm";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await prisma.eventSession.findUnique({
    where: { id },
  });
  if (!session || session.cancelledAt) notFound();

  const defaultValues = {
    date: session.date.toISOString().slice(0, 10),
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
