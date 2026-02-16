import Link from "next/link";
import { SessionForm } from "@/components/admin/SessionForm";

export default function NewSessionPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/sessions" className="text-sm text-muted-foreground hover:text-foreground inline-block">
        ← Sessions
      </Link>
      <h1 className="text-2xl font-mono font-semibold">New session</h1>
      <SessionForm />
    </div>
  );
}
