import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resendConfirmationSchema } from "@/lib/validations/register";
import { checkResendLimit } from "@/lib/rate-limit";
import { generateConfirmationToken, getConfirmationExpiry } from "@/lib/crypto";
import { sendConfirmationEmail } from "@/lib/email";
import { RegistrationStatus } from "@prisma/client";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  try {
    if (!checkResendLimit(req)) {
      return NextResponse.json(
        { error: "Too many requests. Try again later.", code: "RATE_LIMIT" },
        { status: 429 }
      );
    }
    const body = await req.json();
    const parsed = resendConfirmationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    const { sessionId, email } = parsed.data;

    const registration = await prisma.registration.findUnique({
      where: { sessionId_email: { sessionId, email } },
      include: { session: true },
    });

    if (
      registration?.status === RegistrationStatus.PENDING_CONFIRMATION &&
      registration.session &&
      !registration.session.cancelledAt
    ) {
      const { raw, hash } = generateConfirmationToken();
      const expiresAt = getConfirmationExpiry();
      await prisma.registration.update({
        where: { id: registration.id },
        data: {
          confirmationTokenHash: hash,
          confirmationTokenExpiresAt: expiresAt,
        },
      });
      const confirmLink = `${APP_URL}/api/public/confirm?token=${encodeURIComponent(raw)}`;
      const sessionDate = new Date(registration.session.date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      await sendConfirmationEmail({
        to: email,
        name: registration.name,
        sessionPlace: registration.session.place,
        sessionDate,
        confirmLink,
      });
    }

    return NextResponse.json({
      success: true,
      message: "If you have a pending registration, you will receive a new confirmation email shortly.",
    });
  } catch (e) {
    console.error("Resend confirmation error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
