import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions } from "@/db/schema";
import { updateSessionSchema } from "@/lib/validations/session";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = updateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    if (data.cancel) {
      await db
        .update(eventSessions)
        .set({ cancelledAt: new Date() })
        .where(eq(eventSessions.id, id));
      return NextResponse.json({ ok: true });
    }
    const utilities = data.utilities !== undefined
      ? (typeof data.utilities === "string"
          ? data.utilities.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
          : undefined)
      : undefined;
    const tags = data.tags !== undefined
      ? (typeof data.tags === "string"
          ? data.tags.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
          : undefined)
      : undefined;

    const updateData: Record<string, unknown> = {};
    if (data.date !== undefined) updateData.date = data.date;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.place !== undefined) updateData.place = data.place;
    if (data.totalSpots !== undefined) updateData.totalSpots = data.totalSpots;
    if (utilities !== undefined) updateData.utilities = utilities;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.level !== undefined) updateData.level = data.level || null;
    if (tags !== undefined) updateData.tags = tags;
    if (data.registrationOpen !== undefined) updateData.registrationOpen = data.registrationOpen;

    await db
      .update(eventSessions)
      .set(updateData as typeof eventSessions.$inferInsert)
      .where(eq(eventSessions.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Update session error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db
      .update(eventSessions)
      .set({ cancelledAt: new Date() })
      .where(eq(eventSessions.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Cancel session error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
