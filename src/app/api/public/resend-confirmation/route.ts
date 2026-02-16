import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions, registrations } from "@/db/schema";
import { resendConfirmationSchema } from "@/lib/validations/register";
import { checkResendLimit } from "@/lib/rate-limit";
import { generateConfirmationToken, getConfirmationExpiry } from "@/lib/crypto";
import { sendConfirmationEmail } from "@/lib/email";
import { REGISTRATION_STATUS } from "@/db/schema";

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

    const [row] = await db
      .select({
        registrationId: registrations.id,
        name: registrations.name,
        place: eventSessions.place,
        date: eventSessions.date,
        cancelledAt: eventSessions.cancelledAt,
        status: registrations.status,
      })
      .from(registrations)
      .innerJoin(eventSessions, eq(registrations.sessionId, eventSessions.id))
      .where(
        and(
          eq(registrations.sessionId, sessionId),
          eq(registrations.email, email)
        )
      )
      .limit(1);

    if (
      row &&
      row.status === REGISTRATION_STATUS.PENDING_CONFIRMATION &&
      row.cancelledAt === null
    ) {
        const { raw, hash } = generateConfirmationToken();
        const expiresAt = getConfirmationExpiry();
      await db
        .update(registrations)
        .set({
          confirmationTokenHash: hash,
          confirmationTokenExpiresAt: expiresAt,
        })
        .where(eq(registrations.id, row.registrationId));

      const confirmLink = `${APP_URL}/api/public/confirm?token=${encodeURIComponent(raw)}`;
      const sessionDate = new Date(row.date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      await sendConfirmationEmail({
        to: email,
        name: row.name,
        sessionPlace: row.place,
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
