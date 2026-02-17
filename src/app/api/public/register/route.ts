import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions, registrations } from "@/db/schema";
import { registerSchema } from "@/lib/validations/register";
import { checkRegisterLimit } from "@/lib/rate-limit";
import { generateConfirmationToken, getConfirmationExpiry } from "@/lib/crypto";
import { sendConfirmationEmail } from "@/lib/email";
import { REGISTRATION_STATUS } from "@/db/schema";

function getBaseUrl(req: Request): string {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  if (host) return `${proto}://${host}`;
  return url.origin;
}

export async function POST(req: Request) {
  try {
    if (!checkRegisterLimit(req)) {
      return NextResponse.json(
        { error: "Too many requests. Try again later.", code: "RATE_LIMIT" },
        { status: 429 }
      );
    }
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const [session] = await db
      .select()
      .from(eventSessions)
      .where(
        and(
          eq(eventSessions.id, data.sessionId),
          isNull(eventSessions.cancelledAt)
        )
      )
      .limit(1);
    if (!session) {
      return NextResponse.json({ error: "Session not found", code: "NOT_FOUND" }, { status: 404 });
    }
    if (!session.registrationOpen) {
      return NextResponse.json(
        { error: "Registration is closed for this session", code: "CLOSED" },
        { status: 409 }
      );
    }

    const confirmedCount = await db.$count(registrations, and(
      eq(registrations.sessionId, data.sessionId),
      eq(registrations.status, REGISTRATION_STATUS.CONFIRMED)
    ));
    if (confirmedCount >= session.totalSpots) {
      return NextResponse.json(
        { error: "Session is full", code: "FULL" },
        { status: 409 }
      );
    }

    const [existing] = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.sessionId, data.sessionId),
          eq(registrations.email, data.email)
        )
      )
      .limit(1);
    if (existing) {
      if (existing.status === REGISTRATION_STATUS.CONFIRMED) {
        return NextResponse.json(
          { error: "You are already registered for this session", code: "DUPLICATE" },
          { status: 409 }
        );
      }
      if (existing.status === REGISTRATION_STATUS.PENDING_CONFIRMATION) {
        return NextResponse.json(
          { error: "A confirmation email was already sent. Check your inbox or request a new link.", code: "PENDING" },
          { status: 409 }
        );
      }
    }

    const { raw, hash } = generateConfirmationToken();
    const expiresAt = getConfirmationExpiry();

    await db
      .insert(registrations)
      .values({
        sessionId: data.sessionId,
        email: data.email,
        name: data.name,
        surname: data.surname,
        year: data.year,
        group: data.group,
        university: data.university,
        hasCodingExperience: data.hasCodingExperience,
        status: REGISTRATION_STATUS.PENDING_CONFIRMATION,
        confirmationTokenHash: hash,
        confirmationTokenExpiresAt: expiresAt,
      })
      .onConflictDoUpdate({
        target: [registrations.sessionId, registrations.email],
        set: {
          name: data.name,
          surname: data.surname,
          year: data.year,
          group: data.group,
          university: data.university,
          hasCodingExperience: data.hasCodingExperience,
          status: REGISTRATION_STATUS.PENDING_CONFIRMATION,
          confirmationTokenHash: hash,
          confirmationTokenExpiresAt: expiresAt,
        },
      });

    const baseUrl = getBaseUrl(req);
    const confirmLink = `${baseUrl}/api/public/confirm?token=${encodeURIComponent(raw)}`;
    const sessionDate = new Date(session.date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    await sendConfirmationEmail({
      to: data.email,
      name: data.name,
      sessionPlace: session.place,
      sessionDate,
      confirmLink,
    });

    return NextResponse.json({
      success: true,
      message: "Check your email to confirm your registration.",
    });
  } catch (e) {
    console.error("Register API error:", e);
    return NextResponse.json(
      { error: "Something went wrong", code: "INTERNAL" },
      { status: 500 }
    );
  }
}
