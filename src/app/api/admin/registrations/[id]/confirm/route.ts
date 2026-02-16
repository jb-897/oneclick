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
      include: { session: true },
    });
    if (!reg) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }
    if (reg.status === "CONFIRMED") {
      return NextResponse.json({ error: "Already confirmed", code: "CONFLICT" }, { status: 409 });
    }
    const confirmedCount = await prisma.registration.count({
      where: { sessionId: reg.sessionId, status: "CONFIRMED" },
    });
    if (confirmedCount >= reg.session.totalSpots) {
      return NextResponse.json({ error: "Session full", code: "FULL" }, { status: 409 });
    }
    const now = new Date();
    await prisma.$transaction([
      prisma.registration.update({
        where: { id },
        data: {
          status: RegistrationStatus.CONFIRMED,
          confirmedAt: now,
          confirmationTokenHash: null,
          confirmationTokenExpiresAt: null,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: adminSession.user.id,
          action: "REGISTRATION_MANUAL_CONFIRM",
          entityType: "Registration",
          entityId: id,
          metadata: { sessionId: reg.sessionId, email: reg.email },
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Manual confirm error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
