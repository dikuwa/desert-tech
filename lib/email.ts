/**
 * Email service for Desert Tech.
 * Handles transactional emails including invitations, password resets, and notifications.
 */

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@deserttechnology.com.na";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Initialize Resend only if API key is available
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend.
 * Falls back to console logging in development without API key.
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text } = options;

  // Log email in development
  if (!resend) {
    console.log("\n========== EMAIL (Development Mode) ==========");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text || "N/A"}`);
    console.log("==============================================\n");
    return;
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    });

    if (result.error) {
      throw new Error(`Email failed: ${result.error.message}`);
    }

    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    throw error;
  }
}

// ============== INVITATION EMAIL ==============

interface InvitationEmailParams {
  to: string;
  name: string;
  inviterName: string;
  token: string;
  role: string;
  note?: string;
}

export async function sendInvitationEmail(params: InvitationEmailParams): Promise<void> {
  const { to, name, inviterName, token, role, note } = params;

  const invitationUrl = `${appUrl}/admin/invite/accept?token=${token}`;
  const roleDisplay = role.charAt(0) + role.slice(1).toLowerCase();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join Desert Technology</title>
  <style>
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #111; background: #f7f7f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #f68923; padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111; font-size: 20px; margin-top: 0; }
    .button { display: inline-block; background: #f68923; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #dd781c; }
    .details { background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .details p { margin: 8px 0; }
    .details strong { color: #111; }
    .footer { background: #111; color: #9a9a9a; padding: 30px; text-align: center; font-size: 13px; }
    .footer a { color: #f68923; }
    .expiry { color: #dc2626; font-size: 13px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Desert Technology Consultant</h1>
    </div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>You've been invited by <strong>${inviterName}</strong> to join the Desert Technology Consultant team as a <strong>${roleDisplay}</strong>.</p>

      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}

      <div class="details">
        <p><strong>Your Role:</strong> ${roleDisplay}</p>
        <p><strong>Email:</strong> ${to}</p>
      </div>

      <p>Click the button below to set up your account and create your password:</p>

      <a href="${invitationUrl}" class="button">Accept Invitation</a>

      <p class="expiry">This invitation expires in 48 hours and can only be used once.</p>

      <p style="font-size: 13px; color: #6f6f6f; margin-top: 30px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${invitationUrl}" style="color: #f68923; word-break: break-all;">${invitationUrl}</a>
      </p>
    </div>
    <div class="footer">
      <p>Desert Technology Consultant | Namibia</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${name},

You've been invited by ${inviterName} to join the Desert Technology Consultant team as a ${roleDisplay}.

${note ? `Note: ${note}\n` : ""}
Your Role: ${roleDisplay}
Email: ${to}

Click the link below to set up your account:
${invitationUrl}

This invitation expires in 48 hours and can only be used once.

Desert Technology Consultant | Namibia
If you didn't expect this invitation, you can safely ignore this email.
  `.trim();

  await sendEmail({
    to,
    subject: "You're Invited to Join Desert Technology",
    html,
    text,
  });
}

// ============== PASSWORD RESET EMAIL ==============

interface PasswordResetEmailParams {
  to: string;
  token: string;
}

export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<void> {
  const { to, token } = params;

  const resetUrl = `${appUrl}/admin/reset-password?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #111; background: #f7f7f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #f68923; padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111; font-size: 20px; margin-top: 0; }
    .button { display: inline-block; background: #f68923; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #dd781c; }
    .expiry { color: #dc2626; font-size: 13px; margin-top: 20px; }
    .footer { background: #111; color: #9a9a9a; padding: 30px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Desert Technology Consultant</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>We received a request to reset the password for your Desert Technology account (${to}).</p>

      <p>Click the button below to reset your password:</p>

      <a href="${resetUrl}" class="button">Reset Password</a>

      <p class="expiry">This link expires in 1 hour and can only be used once.</p>

      <p style="font-size: 13px; color: #6f6f6f; margin-top: 30px;">
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <p style="font-size: 13px; color: #6f6f6f;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #f68923; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
    <div class="footer">
      <p>Desert Technology Consultant | Namibia</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Reset Your Password

We received a request to reset the password for your Desert Technology account (${to}).

Click the link below to reset your password:
${resetUrl}

This link expires in 1 hour and can only be used once.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

Desert Technology Consultant | Namibia
  `.trim();

  await sendEmail({
    to,
    subject: "Reset Your Desert Technology Password",
    html,
    text,
  });
}

// ============== PASSWORD CHANGED NOTIFICATION ==============

interface PasswordChangedEmailParams {
  to: string;
  name: string;
}

export async function sendPasswordChangedEmail(params: PasswordChangedEmailParams): Promise<void> {
  const { to, name } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Password Has Been Changed</title>
  <style>
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #111; background: #f7f7f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #f68923; padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .alert { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; }
    .footer { background: #111; color: #9a9a9a; padding: 30px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Desert Technology Consultant</h1>
    </div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>Your Desert Technology account password has been successfully changed.</p>

      <div class="alert">
        <strong>Security Notice:</strong> If you didn't make this change, please contact your administrator immediately.
      </div>

      <p>If you made this change, no further action is required.</p>
    </div>
    <div class="footer">
      <p>Desert Technology Consultant | Namibia</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${name},

Your Desert Technology account password has been successfully changed.

SECURITY NOTICE: If you didn't make this change, please contact your administrator immediately.

If you made this change, no further action is required.

Desert Technology Consultant | Namibia
  `.trim();

  await sendEmail({
    to,
    subject: "Your Password Has Been Changed",
    html,
    text,
  });
}

// ============== ACCOUNT STATUS EMAILS ==============

interface AccountStatusEmailParams {
  to: string;
  name: string;
  status: "suspended" | "reactivated";
  reason?: string;
}

export async function sendAccountStatusEmail(params: AccountStatusEmailParams): Promise<void> {
  const { to, name, status, reason } = params;

  const isSuspended = status === "suspended";
  const subject = isSuspended
    ? "Your Desert Technology Account Has Been Suspended"
    : "Your Desert Technology Account Has Been Reactivated";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #111; background: #f7f7f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: ${isSuspended ? "#dc2626" : "#16a34a"}; padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111; font-size: 20px; margin-top: 0; }
    .reason { background: ${isSuspended ? "#fef2f2" : "#ecfdf3"}; padding: 16px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #111; color: #9a9a9a; padding: 30px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Desert Technology Consultant</h1>
    </div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>Your Desert Technology account has been <strong>${isSuspended ? "suspended" : "reactivated"}</strong>.</p>

      ${reason ? `
      <div class="reason">
        <strong>Reason:</strong> ${reason}
      </div>
      ` : ""}

      ${isSuspended
        ? `<p>Your account access has been temporarily disabled. Please contact your administrator for more information.</p>`
        : `<p>Your account access has been restored. You can now sign in to the dashboard.</p>`
      }
    </div>
    <div class="footer">
      <p>Desert Technology Consultant | Namibia</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello ${name},

Your Desert Technology account has been ${isSuspended ? "suspended" : "reactivated"}.

${reason ? `Reason: ${reason}\n` : ""}
${isSuspended
  ? "Your account access has been temporarily disabled. Please contact your administrator for more information."
  : "Your account access has been restored. You can now sign in to the dashboard."
}

Desert Technology Consultant | Namibia
  `.trim();

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}
