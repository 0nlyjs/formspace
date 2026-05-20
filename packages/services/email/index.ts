import nodemailer from "nodemailer";
import { logger } from "@repo/logger";

export interface EmailAnswer {
  label: string;
  type: string;
  value: any;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isFallback = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const secure = process.env.SMTP_SECURE === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      logger.info(`Initializing SMTP transporter: ${host}:${port}`);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    } else {
      this.isFallback = true;
      logger.warn("SMTP credentials not fully configured in environment. Email service will run in mock / Ethereal developer fallback mode.");
    }
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    if (this.isFallback) {
      try {
        logger.info("Generating Ethereal SMTP test account for development...");
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info(`Successfully created Ethereal account: ${testAccount.user}`);
        return this.transporter;
      } catch (err: any) {
        logger.error(`Failed to create Ethereal test account: ${err.message}. Using console logging fallback only.`);
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
        return this.transporter;
      }
    }

    this.initializeTransporter();
    return this.transporter || nodemailer.createTransport({ jsonTransport: true });
  }

  private formatValue(value: any): string {
    if (value === undefined || value === null) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  async sendCreatorNotification(
    creatorEmail: string,
    formTitle: string,
    answers: EmailAnswer[],
    responseId: string
  ) {
    const from = process.env.SMTP_FROM || '"Formspace" <noreply@formspace.dev>';
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;

    const answersHtml = answers
      .map(
        (ans) => `
        <div style="margin-bottom: 16px; padding: 16px; border-radius: 8px; background-color: #18181b; border: 1px solid #27272a;">
          <div style="font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 4px;">
            ${ans.label}
          </div>
          <div style="font-size: 15px; color: #f4f4f5; font-weight: 500;">
            ${this.formatValue(ans.value)}
          </div>
        </div>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Submission Received</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #e4e4e7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #09090b; border-collapse: collapse; border: 1px solid #18181b;">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #3b0764 0%, #09090b 100%); border-bottom: 1px solid #27272a;">
                <div style="display: inline-block; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: #fff;">
                  <span style="color: #a855f7;">Form</span>space
                </div>
                <h1 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">New Response Submitted!</h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #a1a1aa;">Your form <strong>${formTitle}</strong> received a new response.</p>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <h2 style="font-size: 11px; font-weight: 600; color: #a855f7; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #27272a; padding-bottom: 8px; letter-spacing: 0.05em; text-transform: uppercase;">SUBMISSION DETAILS</h2>
                
                ${answersHtml}

                <div style="margin-top: 32px; text-align: center;">
                  <a href="${dashboardUrl}" style="display: inline-block; background-color: #a855f7; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);">
                    View in Dashboard
                  </a>
                </div>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; border-top: 1px solid #18181b; text-align: center; font-size: 12px; color: #71717a;">
                <p style="margin: 0;">This email was sent automatically by Formspace.</p>
                <p style="margin: 4px 0 0 0;">© 2026 Formspace. Built with beautiful aesthetics.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `
Formspace: New Response Received!
Your form "${formTitle}" has received a new response.

ANSWERS:
${answers.map((ans) => `- ${ans.label}: ${this.formatValue(ans.value)}`).join("\n")}

View this response in your dashboard: ${dashboardUrl}
    `;

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to: creatorEmail,
        subject: `🔔 New Response: ${formTitle}`,
        text,
        html,
      });

      logger.info(`Creator notification email sent successfully to ${creatorEmail}`);
      if (this.isFallback) {
        const testUrl = nodemailer.getTestMessageUrl(info);
        console.log("\n" + "=".repeat(80));
        console.log(`✉️  [MOCK EMAIL SENT TO CREATOR]`);
        console.log(`   To:       ${creatorEmail}`);
        console.log(`   Subject:  🔔 New Response: ${formTitle}`);
        if (testUrl) {
          console.log(`   👉 VIEW BEAUTIFUL HTML EMAIL HERE: \x1b[36m\x1b[4m${testUrl}\x1b[0m`);
        }
        console.log("=".repeat(80) + "\n");
      }
    } catch (err: any) {
      logger.error(`Failed to send creator notification email: ${err.message}`);
    }
  }

  async sendRespondentConfirmation(
    respondentEmail: string,
    formTitle: string,
    answers: EmailAnswer[]
  ) {
    const from = process.env.SMTP_FROM || '"Formspace" <noreply@formspace.dev>';

    const answersHtml = answers
      .map(
        (ans) => `
        <div style="margin-bottom: 12px; padding: 12px; border-radius: 6px; background-color: #18181b; border: 1px solid #27272a;">
          <div style="font-size: 11px; color: #a1a1aa; font-weight: 600; margin-bottom: 2px;">
            ${ans.label}
          </div>
          <div style="font-size: 14px; color: #f4f4f5;">
            ${this.formatValue(ans.value)}
          </div>
        </div>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Submission Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #e4e4e7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #09090b; border-collapse: collapse; border: 1px solid #18181b;">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #09090b 100%); border-bottom: 1px solid #27272a;">
                <div style="display: inline-block; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: #fff;">
                  <span style="color: #6366f1;">Form</span>space
                </div>
                <h1 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">Thank You!</h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #a1a1aa;">Your response to <strong>${formTitle}</strong> has been successfully submitted.</p>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 15px; color: #e4e4e7; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
                  Hi there, <br><br>
                  Thanks for taking the time to fill out this form! Below is a record of the answers you submitted.
                </p>

                <h2 style="font-size: 11px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; border-bottom: 1px solid #27272a; padding-bottom: 6px;">YOUR SUBMISSION</h2>
                
                ${answersHtml}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; border-top: 1px solid #18181b; text-align: center; font-size: 12px; color: #71717a;">
                <p style="margin: 0;">This is a copy of your response for your records.</p>
                <p style="margin: 4px 0 0 0;">Powered by Formspace.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `
Thank You!
Your response to "${formTitle}" has been successfully submitted.

Here is a copy of your answers:
${answers.map((ans) => `- ${ans.label}: ${this.formatValue(ans.value)}`).join("\n")}

Powered by Formspace.
    `;

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to: respondentEmail,
        subject: `✍️ Copy of your response: ${formTitle}`,
        text,
        html,
      });

      logger.info(`Respondent confirmation email sent successfully to ${respondentEmail}`);
      if (this.isFallback) {
        const testUrl = nodemailer.getTestMessageUrl(info);
        console.log("\n" + "=".repeat(80));
        console.log(`✉️  [MOCK EMAIL SENT TO RESPONDENT]`);
        console.log(`   To:       ${respondentEmail}`);
        console.log(`   Subject:  ✍️ Copy of your response: ${formTitle}`);
        if (testUrl) {
          console.log(`   👉 VIEW BEAUTIFUL HTML EMAIL HERE: \x1b[36m\x1b[4m${testUrl}\x1b[0m`);
        }
        console.log("=".repeat(80) + "\n");
      }
    } catch (err: any) {
      logger.error(`Failed to send respondent confirmation email: ${err.message}`);
    }
  }
}

export default EmailService;
