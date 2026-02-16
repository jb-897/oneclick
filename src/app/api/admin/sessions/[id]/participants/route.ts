import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const registrations = await prisma.registration.findMany({
    where: { sessionId: id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  if (format === "csv") {
    const header = "Name,Surname,Email,Year,Group,University,Coding Experience,Status,Confirmed At\n";
    const rows = registrations.map(
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
    confirmed: registrations.filter((r) => r.status === "CONFIRMED"),
    pending: registrations.filter((r) => r.status === "PENDING_CONFIRMATION"),
    cancelled: registrations.filter((r) => r.status === "CANCELLED"),
  });
}

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
