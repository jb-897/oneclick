import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RegistrationStatus } from "@prisma/client";

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
    const reg = await prisma.registration.findUnique({
      where: { id },
    });
    if (!reg) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }
    await prisma.$transaction([
      prisma.registration.update({
        where: { id },
        data: { status: RegistrationStatus.CANCELLED },
      }),
      prisma.auditLog.create({
        data: {
          userId: adminSession.user.id,
          action: "REGISTRATION_MANUAL_CANCEL",
          entityType: "Registration",
          entityId: id,
          metadata: { sessionId: reg.sessionId, email: reg.email },
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Manual cancel error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
