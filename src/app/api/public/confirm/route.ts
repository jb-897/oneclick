import { NextResponse } from "next/server";
import { eq, and, gt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions, registrations } from "@/db/schema";
import { hashConfirmationToken } from "@/lib/crypto";
import { REGISTRATION_STATUS } from "@/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token?.trim()) {
    return NextResponse.redirect(new URL("/confirm?error=missing", req.url));
  }

  const hash = hashConfirmationToken(token.trim());
  const now = new Date();

  const [row] = await db
    .select({
      registrationId: registrations.id,
      sessionId: registrations.sessionId,
      totalSpots: eventSessions.totalSpots,
    })
    .from(registrations)
    .innerJoin(eventSessions, eq(registrations.sessionId, eventSessions.id))
    .where(
      and(
        eq(registrations.confirmationTokenHash, hash),
        eq(registrations.status, REGISTRATION_STATUS.PENDING_CONFIRMATION),
        gt(registrations.confirmationTokenExpiresAt, now)
      )
    )
    .limit(1);

  if (!row) {
    return NextResponse.redirect(new URL("/confirm?error=invalid", req.url));
  }

  const updateResult = await db.execute(sql`
    UPDATE registrations
    SET
      status = 'CONFIRMED',
      confirmed_at = ${now},
      confirmation_token_hash = NULL,
      confirmation_token_expires_at = NULL
    WHERE id IN (
      SELECT r.id FROM registrations r
      INNER JOIN event_sessions s ON s.id = r.session_id
      WHERE r.confirmation_token_hash = ${hash}
        AND r.status = 'PENDING_CONFIRMATION'
        AND r.confirmation_token_expires_at > ${now}
        AND (SELECT count(*) FROM registrations r2 WHERE r2.session_id = r.session_id AND r2.status = 'CONFIRMED') < s.total_spots
    )
    RETURNING id
  `);

  const rows = Array.isArray(updateResult) ? updateResult : [];
  if (rows.length > 0) {
    return NextResponse.redirect(new URL("/confirm?success=1", req.url));
  }

  return NextResponse.redirect(new URL("/confirm?error=full", req.url));
}
