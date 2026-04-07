import { Resend } from 'resend';
import { env } from '@server/config/env';
import { logger } from '@server/utils/logger';

// Initialize Resend
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    logger.warn('Resend not configured, skipping email send');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM || 'RentConnect <noreply@rentconnect.app>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      logger.error('Failed to send email:', error);
      return false;
    }

    logger.info('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send email verification code
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - RentConnect</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 32px; text-align: center;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #1f2937;">Welcome to RentConnect!</h1>
                <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                  Thanks for signing up. To complete your registration and verify your email address, please enter the following verification code:
                </p>
                
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                  <p style="margin: 0; font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px; font-family: monospace;">${code}</p>
                </div>
                
                <p style="margin: 24px 0 16px 0; font-size: 14px; color: #6b7280;">
                  Or click the button below to verify your email automatically:
                </p>
                
                <a href="${env.CLIENT_URL}/verify-email?code=${code}" 
                   style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 16px 0;">
                  Verify Email Address
                </a>
                
                <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280;">
                  This code will expire in 24 hours. If you didn't create an account on RentConnect, please ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px; background-color: #f9fafb; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                  © ${new Date().getFullYear()} RentConnect. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  Need help? <a href="${env.CLIENT_URL}/support" style="color: #4f46e5; text-decoration: none;">Contact Support</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const text = `
Welcome to RentConnect!

Thanks for signing up. To complete your registration and verify your email address, please enter the following verification code:

Your Verification Code: ${code}

Or visit this link to verify your email: ${env.CLIENT_URL}/verify-email?code=${code}

This code will expire in 24 hours. If you didn't create an account on RentConnect, please ignore this email.

© ${new Date().getFullYear()} RentConnect. All rights reserved.
  `.trim();

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - RentConnect',
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - RentConnect</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 32px; text-align: center;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #1f2937;">Forgot Your Password?</h1>
                <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                  We received a request to reset your password. Click the button below to choose a new password:
                </p>
                
                <a href="${resetUrl}" 
                   style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 16px 0;">
                  Reset Password
                </a>
                
                <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280;">
                  This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </p>
                
                <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280;">
                  For security reasons, this link can only be used once.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px; background-color: #f9fafb; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                  © ${new Date().getFullYear()} RentConnect. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  Need help? <a href="${env.CLIENT_URL}/support" style="color: #4f46e5; text-decoration: none;">Contact Support</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const text = `
Password Reset Request

We received a request to reset your password. Visit the link below to choose a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.

For security reasons, this link can only be used once.

© ${new Date().getFullYear()} RentConnect. All rights reserved.
  `.trim();

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - RentConnect',
    html,
    text,
    replyTo: 'support@rentconnect.app',
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  email: string,
  bookingDetails: {
    bookingId: string;
    itemName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    ownerName: string;
  }
): Promise<boolean> {
  const { bookingId, itemName, startDate, endDate, totalPrice, ownerName } = bookingDetails;
  
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed - RentConnect</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <svg style="width: 64px; height: 64px; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                
                <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #1f2937; text-align: center;">Booking Confirmed!</h1>
                <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.5; text-align: center;">
                  Great news! Your booking has been confirmed. Here are the details:
                </p>
                
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                  <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1f2937;">${itemName}</h2>
                  
                  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Booking ID:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #1f2937; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">#${bookingId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Owner:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; text-align: right;">${ownerName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Start Date:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; text-align: right;">${startDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">End Date:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; text-align: right;">${endDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0 8px 0; font-size: 14px; color: #6b7280; font-weight: 600;">Total Paid:</td>
                      <td style="padding: 12px 0 8px 0; font-size: 18px; color: #10b981; font-weight: bold; text-align: right;">£${totalPrice}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin: 16px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                  <strong>What's Next?</strong><br/>
                  The owner will be notified of your booking. You'll receive another email with pickup/delivery instructions closer to your start date.
                </p>
                
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${env.CLIENT_URL}/bookings/${bookingId}" 
                     style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                    View Booking Details
                  </a>
                </div>
                
                <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">
                  Need to make changes or have questions? Contact the owner through your dashboard or reach out to our support team.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px; background-color: #f9fafb; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                  © ${new Date().getFullYear()} RentConnect. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  Need help? <a href="${env.CLIENT_URL}/support" style="color: #4f46e5; text-decoration: none;">Contact Support</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: 'Booking Confirmed - RentConnect',
    html,
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(
  email: string,
  paymentDetails: {
    amount: number;
    date: string;
    description: string;
    transactionId: string;
  }
): Promise<boolean> {
  const { amount, date, description, transactionId } = paymentDetails;
  
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - RentConnect</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 32px; text-align: center;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #1f2937;">Payment Receipt</h1>
                <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                  Thank you for your payment. Here's your receipt:
                </p>
                
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                  <p style="margin: 0 0 16px 0; font-size: 32px; font-weight: bold; color: #10b981;">£${amount}</p>
                  
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Date:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; text-align: right;">${date}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Description:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; text-align: right;">${description}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Transaction ID:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #1f2937; border-bottom: 1px solid #e5e7eb; text-align: right;">${transactionId}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">
                  Questions about this charge? Contact us at support@rentconnect.app
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px; background-color: #f9fafb; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                  © ${new Date().getFullYear()} RentConnect. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: 'Payment Receipt - RentConnect',
    html,
  });
}
