import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { registrations, auditLogs } from "@/db/schema";
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
    await db.transaction(async (tx) => {
      await tx
        .update(registrations)
        .set({ status: REGISTRATION_STATUS.CANCELLED })
        .where(eq(registrations.id, id));
      await tx.insert(auditLogs).values({
        userId: adminSession.email,
        action: "REGISTRATION_MANUAL_CANCEL",
        entityType: "Registration",
        entityId: id,
        metadata: { sessionId: reg.sessionId, email: reg.email },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Manual cancel error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
