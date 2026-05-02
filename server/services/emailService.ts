import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'BookSync - Your OTP Verification Code';
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#6366f1">BookSync OTP</h2>
      <p>Your verification code is:</p>
      <div style="font-size:2.5rem;font-weight:800;letter-spacing:0.3em;color:#6366f1;padding:16px;background:#f1f5f9;border-radius:8px;text-align:center">${otp}</div>
      <p style="color:#64748b;font-size:0.85rem">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>`;

  if (transporter) {
    try {
      await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
      return;
    } catch (err: any) {
      console.error('❌ Email Error (Check connection/DNS):', err.message);
      // Fallback to console simulation below
    }
  }

  console.log(`\n📧 [EMAIL FALLBACK] To: ${to}\n   Subject: ${subject}\n   OTP: ${otp}\n   (Real email failed, check server logs)\n`);
};

export const sendResetEmail = async (to: string, resetUrl: string): Promise<void> => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: 'BookSync - Password Reset Link',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      });
      return;
    } catch (err: any) {
      console.error('❌ Email Error (Check connection/DNS):', err.message);
    }
  }

  console.log(`\n📧 [EMAIL FALLBACK] Reset link for ${to}: ${resetUrl}\n`);
};
