import { Resend } from "resend";

const from = process.env.EMAIL_FROM ?? "Vibe Coding <noreply@example.com>";
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendConfirmationEmail(params: {
  to: string;
  name: string;
  sessionPlace: string;
  sessionDate: string;
  confirmLink: string;
}) {
  const { to, name, sessionPlace, sessionDate, confirmLink } = params;
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping email send");
    return { ok: true as const, id: "no-key" };
  }
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: `Confirm your registration — ${sessionPlace}`,
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>You registered for a Vibe Coding class at <strong>${escapeHtml(sessionPlace)}</strong> on ${escapeHtml(sessionDate)}.</p>
      <p>Please confirm your registration by clicking the link below (valid for 24 hours):</p>
      <p><a href="${confirmLink}" style="color: #0ea5e9;">Confirm registration</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
      <p>— Vibe Coding</p>
    `,
  });
  if (error) {
    console.error("Resend error:", error);
    return { ok: false as const, error };
  }
  return { ok: true as const, id: data?.id };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
