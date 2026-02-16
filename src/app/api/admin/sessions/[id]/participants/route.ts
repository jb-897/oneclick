import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { eq, asc, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { registrations } from "@/db/schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format");

  const regList = await db
    .select()
    .from(registrations)
    .where(eq(registrations.sessionId, id))
    .orderBy(asc(registrations.status), desc(registrations.createdAt));

  if (format === "csv") {
    const header = "Name,Surname,Email,Year,Group,University,Coding Experience,Status,Confirmed At\n";
    const rows = regList.map(
      (r) =>
        `${escapeCsv(r.name)},${escapeCsv(r.surname)},${escapeCsv(r.email)},${escapeCsv(r.year)},${escapeCsv(r.group)},${escapeCsv(r.university)},${r.hasCodingExperience ? "Yes" : "No"},${r.status},${r.confirmedAt ? r.confirmedAt.toISOString() : ""}`
    );
    const csv = header + rows.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="participants-${id}.csv"`,
      },
    });
  }

  return NextResponse.json({
    confirmed: regList.filter((r) => r.status === "CONFIRMED"),
    pending: regList.filter((r) => r.status === "PENDING_CONFIRMATION"),
    cancelled: regList.filter((r) => r.status === "CANCELLED"),
  });
}

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
