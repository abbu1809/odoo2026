import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;
let warnedNoSmtp = false;

function getTransporter(): Transporter | null {
  if (!env.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

/**
 * Sends an email if SMTP is configured (SMTP_HOST env var); otherwise logs a
 * one-time warning and no-ops, so the stack still boots without mail
 * credentials (see Todo.md - email reminders/welcome messages).
 */
export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const client = getTransporter();
  if (!client) {
    if (!warnedNoSmtp) {
      console.warn("[mailer] SMTP_HOST is not configured — emails will be skipped (logged only).");
      warnedNoSmtp = true;
    }
    console.log(`[mailer] (skipped) would send "${opts.subject}" to ${opts.to}`);
    return;
  }

  try {
    await client.sendMail({ from: env.smtp.from, to: opts.to, subject: opts.subject, html: opts.html });
  } catch (error) {
    console.error(`[mailer] failed to send "${opts.subject}" to ${opts.to}:`, error);
  }
}
