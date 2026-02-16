"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/admin/logout/actions";

export function SignOutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" size="sm">
        Sign out
      </Button>
    </form>
  );
}
