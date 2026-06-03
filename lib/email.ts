/**
 * Email sending utility using Resend.
 * Falls back to console logging when RESEND_API_KEY is not set.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@deserttechnology.com.na";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.log("[email] No RESEND_API_KEY set — would have sent email:", {
      to,
      subject,
      htmlLength: html.length,
    });
    return { success: true, mock: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log("[email] Sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("[email] Failed to send:", error);
    return { success: false, error };
  }
}
