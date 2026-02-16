import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SearchParams = { success?: string; error?: string };

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const success = params.success === "1";
  const error = params.error;

  let title: string;
  let message: string;

  if (success) {
    title = "You're confirmed";
    message = "Your registration is confirmed. We'll see you at the session.";
  } else if (error === "missing") {
    title = "Link invalid";
    message = "No confirmation token was provided. Use the link from your email.";
  } else if (error === "invalid") {
    title = "Link invalid or expired";
    message = "This confirmation link is invalid or has expired. You can request a new one from the resend page.";
  } else if (error === "full") {
    title = "Session full";
    message = "This session is now full. Your registration could not be confirmed.";
  } else {
    title = "Confirmation";
    message = "Use the link in your email to confirm your registration.";
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="max-w-md w-full border-primary/20">
        <CardHeader>
          <h1 className="text-xl font-mono font-semibold">{title}</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="default" className="font-mono">
              <Link href="/sessions">View sessions</Link>
            </Button>
            {error === "invalid" && (
              <Button asChild variant="outline" className="font-mono">
                <Link href="/resend-confirmation">Resend confirmation</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
