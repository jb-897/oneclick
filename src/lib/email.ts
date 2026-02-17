import { Resend } from "resend";

const from = process.env.EMAIL_FROM ?? "Vibe Coding <noreply@example.com>";
const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

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
  const baseUrl = (() => {
    try {
      return new URL(confirmLink).origin;
    } catch {
      return appUrl;
    }
  })();
  const umvasLogoUrl = `${baseUrl}/UMVAS%20logo.jpg`;
  const lfukLogoUrl = `${baseUrl}/LFUK%20logo.png`;
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
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';">
        

        <p>Hi ${escapeHtml(name)},</p>
        <p>You registered for a Vibe Coding class at <strong>${escapeHtml(sessionPlace)}</strong> on ${escapeHtml(sessionDate)}.</p>
        <p>Please confirm your registration by clicking the link below (valid for 24 hours):</p>
        <p><a href="${confirmLink}" style="color: #00ffcc; text-decoration: underline;">Confirm registration</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>— Best,<br />Your Team at the Department of Medical Education and Simulation</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 0 0 18px 0;">
          <tr>
            <td align="left" style="padding: 0;">
              <img src="${umvasLogoUrl}" alt="UMVAS" width="160" height="48" style="display:block; height: 48px; width: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
            <td align="right" style="padding: 0;">
              <img src="${lfukLogoUrl}" alt="LFUK" width="130" height="41" style="display:block; height: 41px; width: 130px; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>
        </table>
      </div>
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
