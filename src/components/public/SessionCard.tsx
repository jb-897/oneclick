"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventSession } from "@/db/schema";

type SessionWithCount = EventSession & {
  _count?: { registrations: number };
  confirmedCount?: number;
};

function getStatus(
  session: SessionWithCount,
): "open" | "full" | "closed" {
  if (session.cancelledAt) return "closed";
  if (!session.registrationOpen) return "closed";
  const confirmed = session.confirmedCount ?? session._count?.registrations ?? 0;
  if (confirmed >= session.totalSpots) return "full";
  return "open";
}

export function SessionCard({ session }: { session: SessionWithCount }) {
  const prefersReducedMotion = useReducedMotion();
  const status = getStatus(session);
  const confirmedCount =
    typeof session.confirmedCount === "number"
      ? session.confirmedCount
      : (session as { _count?: { registrations: number } })._count?.registrations ?? 0;
  const spotsLeft = Math.max(0, session.totalSpots - confirmedCount);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      className="h-full"
    >
    <Card className="border-primary/20 bg-card/80 transition-shadow hover:shadow-lg hover:shadow-primary/5 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <time className="font-mono text-sm text-muted-foreground">
            {new Date(session.date).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
          <Badge
            variant={status === "open" ? "default" : status === "full" ? "secondary" : "outline"}
            className="font-mono text-xs"
          >
            {status === "open" ? "Open" : status === "full" ? "Full" : "Closed"}
          </Badge>
        </div>
        <h3 className="font-mono font-semibold text-lg mt-1">{session.place}</h3>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>
          {session.startTime} · {session.durationMinutes} min
        </p>
        <p>
          {spotsLeft} / {session.totalSpots} spots left
        </p>
        {session.utilities?.length > 0 && (
          <p className="text-xs">Bring: {session.utilities.join(", ")}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="default" size="sm" className="font-mono" disabled={status !== "open"}>
          <Link href={status === "open" ? `/sessions/${session.id}` : "#"}>
            {status === "open" ? "View & register" : status === "full" ? "Full" : "Closed"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  );
}
