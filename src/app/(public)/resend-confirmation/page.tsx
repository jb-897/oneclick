import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { ResendConfirmationForm, type ResendSessionOption } from "@/components/public/ResendConfirmationForm";

export const dynamic = "force-dynamic";

export default async function ResendConfirmationPage() {
  const sessions = await db
    .select({
      id: eventSessions.id,
      place: eventSessions.place,
      date: eventSessions.date,
      startTime: eventSessions.startTime,
      cancelledAt: eventSessions.cancelledAt,
      registrationOpen: eventSessions.registrationOpen,
    })
    .from(eventSessions)
    .where(isNull(eventSessions.cancelledAt))
    .orderBy(asc(eventSessions.date), asc(eventSessions.startTime));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: ResendSessionOption[] = sessions
    .filter((s) => {
      const d = new Date(String(s.date));
      return !isNaN(d.getTime()) && d >= today;
    })
    .map((s) => ({
      id: s.id,
      place: s.place,
      date: String(s.date),
      startTime: s.startTime,
    }));

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="max-w-md w-full border-primary/20">
        <ResendConfirmationForm sessions={upcoming} />
      </Card>
    </div>
  );
}
