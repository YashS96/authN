/**
 * Outbound port for email sending.
 */
export interface IEmailService {
  sendWelcomeEmail(to: string, name?: string): Promise<void>;
  sendPasswordResetEmail(to: string, link: string): Promise<void>;
  sendEmailVerificationEmail(to: string, link: string): Promise<void>;
}
