import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db/client";
import { eventSessions } from "@/db/schema";
import { createSessionSchema } from "@/lib/validations/session";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const utilities = data.utilities
      ? data.utilities.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
      : [];
    const tags = data.tags
      ? data.tags.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
      : [];

    const [event] = await db
      .insert(eventSessions)
      .values({
        date: data.date,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        place: data.place,
        totalSpots: data.totalSpots,
        utilities,
        description: data.description || null,
        level: data.level || null,
        tags,
        registrationOpen: data.registrationOpen ?? true,
      })
      .returning();
    return NextResponse.json(event);
  } catch (e) {
    console.error("Create session error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
