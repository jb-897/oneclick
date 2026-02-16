import Link from "next/link";
import { eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { eventSessions, registrations } from "@/db/schema";
import { REGISTRATION_STATUS } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const [sessionsCount, registrationsCount, confirmedCount] = await Promise.all([
    db.$count(eventSessions, isNull(eventSessions.cancelledAt)),
    db.$count(registrations),
    db.$count(registrations, eq(registrations.status, REGISTRATION_STATUS.CONFIRMED)),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-mono font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of sessions and registrations.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold text-primary">{sessionsCount}</p>
            <Link href="/admin/sessions">
              <Button variant="link" className="px-0 mt-2">View all</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold">{registrationsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold text-accent">{confirmedCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
