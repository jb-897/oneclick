import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashConfirmationToken } from "@/lib/crypto";
import { RegistrationStatus } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token?.trim()) {
    return NextResponse.redirect(new URL("/confirm?error=missing", req.url));
  }

  const hash = hashConfirmationToken(token.trim());
  const now = new Date();

  const registration = await prisma.registration.findFirst({
    where: {
      confirmationTokenHash: hash,
      status: RegistrationStatus.PENDING_CONFIRMATION,
      confirmationTokenExpiresAt: { gt: now },
    },
    include: { session: true },
  });

  if (!registration) {
    return NextResponse.redirect(new URL("/confirm?error=invalid", req.url));
  }

  const confirmedCount = await prisma.registration.count({
    where: { sessionId: registration.sessionId, status: RegistrationStatus.CONFIRMED },
  });
  if (confirmedCount >= registration.session.totalSpots) {
    return NextResponse.redirect(new URL("/confirm?error=full", req.url));
  }

  await prisma.$transaction(async (tx) => {
    await tx.registration.update({
      where: { id: registration.id },
      data: {
        status: RegistrationStatus.CONFIRMED,
        confirmedAt: now,
        confirmationTokenHash: null,
        confirmationTokenExpiresAt: null,
      },
    });
  });

  return NextResponse.redirect(new URL("/confirm?success=1", req.url));
}
