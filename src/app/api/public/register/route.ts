import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/register";
import { checkRegisterLimit } from "@/lib/rate-limit";
import { generateConfirmationToken, getConfirmationExpiry } from "@/lib/crypto";
import { sendConfirmationEmail } from "@/lib/email";
import { RegistrationStatus } from "@prisma/client";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

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

    const session = await prisma.eventSession.findFirst({
      where: { id: data.sessionId, cancelledAt: null },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found", code: "NOT_FOUND" }, { status: 404 });
    }
    if (!session.registrationOpen) {
      return NextResponse.json(
        { error: "Registration is closed for this session", code: "CLOSED" },
        { status: 409 }
      );
    }

    const confirmedCount = await prisma.registration.count({
      where: { sessionId: data.sessionId, status: "CONFIRMED" },
    });
    if (confirmedCount >= session.totalSpots) {
      return NextResponse.json(
        { error: "Session is full", code: "FULL" },
        { status: 409 }
      );
    }

    const existing = await prisma.registration.findUnique({
      where: {
        sessionId_email: { sessionId: data.sessionId, email: data.email },
      },
    });
    if (existing) {
      if (existing.status === "CONFIRMED") {
        return NextResponse.json(
          { error: "You are already registered for this session", code: "DUPLICATE" },
          { status: 409 }
        );
      }
      if (existing.status === "PENDING_CONFIRMATION") {
        return NextResponse.json(
          { error: "A confirmation email was already sent. Check your inbox or request a new link.", code: "PENDING" },
          { status: 409 }
        );
      }
    }

    const { raw, hash } = generateConfirmationToken();
    const expiresAt = getConfirmationExpiry();

    await prisma.registration.upsert({
      where: { sessionId_email: { sessionId: data.sessionId, email: data.email } },
      create: {
        sessionId: data.sessionId,
        email: data.email,
        name: data.name,
        surname: data.surname,
        year: data.year,
        group: data.group,
        university: data.university,
        hasCodingExperience: data.hasCodingExperience,
        status: RegistrationStatus.PENDING_CONFIRMATION,
        confirmationTokenHash: hash,
        confirmationTokenExpiresAt: expiresAt,
      },
      update: {
        name: data.name,
        surname: data.surname,
        year: data.year,
        group: data.group,
        university: data.university,
        hasCodingExperience: data.hasCodingExperience,
        status: RegistrationStatus.PENDING_CONFIRMATION,
        confirmationTokenHash: hash,
        confirmationTokenExpiresAt: expiresAt,
      },
    });

    const confirmLink = `${APP_URL}/api/public/confirm?token=${encodeURIComponent(raw)}`;
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
