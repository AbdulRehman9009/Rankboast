import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true", // true for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
    const appName = "RankBoast";
    const from = `"${appName}" <${process.env.SMTP_USER}>`;

    await transporter.sendMail({
        from,
        to,
        subject: `Reset your ${appName} password`,
        text: `You requested a password reset.\n\nClick the link below to create a new password:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111118;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 20px;">
                <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">R RankBoast</span>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                We received a request to reset your ${appName} password. Click the button below to set a new one. This link is valid for <strong style="color:#e2e8f0;">1 hour</strong>.
              </p>
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;">
                  Reset Password
                </a>
              </div>
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Or paste this URL into your browser:</p>
              <p style="margin:0;font-size:11px;color:#4f46e5;word-break:break-all;">${resetUrl}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e1e2e;">
              <p style="margin:0;font-size:11px;color:#475569;text-align:center;">
                If you didn&apos;t request a password reset, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
}
