import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions, registrations, auditLogs } from "@/db/schema";
import { REGISTRATION_STATUS } from "@/db/schema";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSession = await requireAdmin();
  if (!adminSession) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const [reg] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id))
      .limit(1);
    if (!reg) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }
    if (reg.status === REGISTRATION_STATUS.CONFIRMED) {
      return NextResponse.json({ error: "Already confirmed", code: "CONFLICT" }, { status: 409 });
    }

    const [sessionRow] = await db
      .select({ totalSpots: eventSessions.totalSpots })
      .from(eventSessions)
      .where(eq(eventSessions.id, reg.sessionId))
      .limit(1);
    if (!sessionRow) {
      return NextResponse.json({ error: "Session not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const confirmedCount = await db.$count(registrations, and(
      eq(registrations.sessionId, reg.sessionId),
      eq(registrations.status, REGISTRATION_STATUS.CONFIRMED)
    ));
    if (confirmedCount >= sessionRow.totalSpots) {
      return NextResponse.json({ error: "Session full", code: "FULL" }, { status: 409 });
    }

    const now = new Date();
    await db.transaction(async (tx) => {
      await tx
        .update(registrations)
        .set({
          status: REGISTRATION_STATUS.CONFIRMED,
          confirmedAt: now,
          confirmationTokenHash: null,
          confirmationTokenExpiresAt: null,
        })
        .where(eq(registrations.id, id));
      await tx.insert(auditLogs).values({
        userId: adminSession.email,
        action: "REGISTRATION_MANUAL_CONFIRM",
        entityType: "Registration",
        entityId: id,
        metadata: { sessionId: reg.sessionId, email: reg.email },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Manual confirm error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
