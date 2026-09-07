import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS') ?? 'onboarding@resend.dev';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  }

  async sendVerificationEmail(to: string, name: string, rawToken: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${rawToken}`;

    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'Verify your Sprintly account',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Welcome to Sprintly, ${name}</h2>
          <p>Confirm your email address to activate your account.</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#7a2e3a;color:#fff;text-decoration:none;border-radius:6px;">
              Verify email
            </a>
          </p>
          <p>Or paste this link into your browser:</p>
          <p>${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send verification email to ${to}: ${error.message}`);
      throw new Error('Could not send verification email');
    }
  }

  async sendInvitationEmail(
    to: string,
    inviterName: string,
    projectName: string,
    rawToken: string,
  ): Promise<void> {
    const registerUrl = `${this.frontendUrl}/register?invite=${rawToken}`;

    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: `${inviterName} invited you to ${projectName} on Sprintly`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>You've been invited to ${projectName}</h2>
          <p>${inviterName} invited you to collaborate on <strong>${projectName}</strong> on Sprintly.</p>
          <p>
            <a href="${registerUrl}" style="display:inline-block;padding:10px 20px;background:#7a2e3a;color:#fff;text-decoration:none;border-radius:6px;">
              Create your account
            </a>
          </p>
          <p>Or paste this link into your browser:</p>
          <p>${registerUrl}</p>
          <p>This invitation expires in 7 days.</p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send invitation email to ${to}: ${error.message}`);
      throw new Error('Could not send invitation email');
    }
  }
}