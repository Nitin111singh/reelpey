import config from "@/config/config";
import { getEmailService } from "@/lib/email/email-factory";
import {
  getVerificationEmailHtml,
  getResetPasswordEmailHtml,
} from "@/lib/email/email-templates";

/**
 * High-level email sending functions.
 * Uses the Strategy-Pattern email service under the hood.
 */

/**
 * Send email verification link to the user.
 */
export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const verifyUrl = `${config.APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(
    to
  )}`;
  const html = getVerificationEmailHtml(verifyUrl);
  const emailService = getEmailService();

  await emailService.sendEmail(to, "Verify your email — Reelpey", html);
}

/**
 * Send password reset link to the user.
 */
export async function sendResetPasswordEmail(
  to: string,
  token: string
): Promise<void> {
  const resetUrl = `${config.APP_URL}/reset-password?token=${token}`;
  const html = getResetPasswordEmailHtml(resetUrl);
  const emailService = getEmailService();

  await emailService.sendEmail(to, "Reset your password — Reelpey", html);
}
