"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Registration } from "@prisma/client";

export function ParticipantsTable({
  confirmed,
  pending,
}: {
  confirmed: Registration[];
  pending: Registration[];
}) {
  const confirmRegistration = async (id: string) => {
    await fetch(`/api/admin/registrations/${id}/confirm`, { method: "POST" });
    window.location.reload();
  };
  const cancelRegistration = async (id: string) => {
    await fetch(`/api/admin/registrations/${id}/cancel`, { method: "POST" });
    window.location.reload();
  };

  const rows = [
    ...confirmed.map((r) => ({ ...r, status: "CONFIRMED" as const })),
    ...pending.map((r) => ({ ...r, status: "PENDING" as const })),
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>University</TableHead>
          <TableHead>Coding exp.</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              No participants yet.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono">
                {r.name} {r.surname}
              </TableCell>
              <TableCell className="font-mono text-sm">{r.email}</TableCell>
              <TableCell>{r.year}</TableCell>
              <TableCell>{r.group}</TableCell>
              <TableCell>{r.university}</TableCell>
              <TableCell>{r.hasCodingExperience ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Badge variant={r.status === "CONFIRMED" ? "default" : "secondary"} className="text-xs">
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {r.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => confirmRegistration(r.id)}
                    className="mr-2"
                  >
                    Confirm
                  </Button>
                )}
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => cancelRegistration(r.id)}
                  >
                    Cancel
                  </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
