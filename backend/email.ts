import "server-only";

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Same key → Resend sends at most once (safe when a webhook is retried). */
  idempotencyKey?: string;
}

/**
 * Sends through Resend's HTTP API. Never throws: a failed email must not undo
 * or retry a paid order, so problems are logged instead.
 * Without RESEND_API_KEY / EMAIL_FROM configured, emails are skipped.
 */
export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.info(`[email] skipped (Resend not configured): "${email.subject}" → ${email.to}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(email.idempotencyKey && { "Idempotency-Key": email.idempotencyKey }),
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo && { reply_to: email.replyTo }),
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend rejected "${email.subject}" (${res.status}):`, await res.text());
    }
  } catch (err) {
    console.error(`[email] failed to send "${email.subject}":`, err);
  }
}
