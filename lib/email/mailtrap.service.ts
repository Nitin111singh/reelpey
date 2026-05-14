import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import config from "@/config/config";
import type { IEmailService } from "./email-service.interface";

/**
 * Mailtrap email service — using API token (nodemailer transport)
 */
export class MailtrapEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  private from: { address: string; name: string };

  constructor() {
    this.from = {
      address: config.EMAIL_FROM,
      name: "Reelpey",
    };

    this.transporter = nodemailer.createTransport(
      MailtrapTransport({
        token: config.MAILTRAP_API_KEY,
      }),
    );
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: [to],
        subject,
        html,
      });

      console.log(`Email sent to: ${to}`, info);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}
