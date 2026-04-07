import { prisma } from '@server/database/prisma';
import { AppError } from '@server/utils/app-error';
import { generateOTP, sendOTP as sendTwilioOTP, isValidPhoneNumber } from '@server/services/sms.service';
import { sendEmail } from '@server/services/email.service';

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

interface SendOTPRequest {
  userId: string;
  phoneNumber?: string;
  email?: string;
  method: 'sms' | 'email';
}

interface VerifyOTPRequest {
  userId: string;
  code: string;
  type: 'phone' | 'email';
}

/**
 * Send OTP verification code
 */
export async function sendVerificationCode(request: SendOTPRequest): Promise<{ success: boolean; message: string }> {
  const { userId, phoneNumber, email, method } = request;

  // Validate input
  if (method === 'sms' && !phoneNumber) {
    throw new AppError('Phone number is required for SMS verification', 400);
  }
  
  if (method === 'email' && !email) {
    throw new AppError('Email is required for email verification', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      phoneVerified: true,
      phoneVerificationExpiresAt: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if already verified
  if (method === 'sms' && user.phoneVerified) {
    return { success: false, message: 'Phone number is already verified' };
  }

  // Check cooldown period
  if (user.phoneVerificationExpiresAt) {
    const now = new Date();
    const expiresAt = new Date(user.phoneVerificationExpiresAt);
    const cooldownEnd = new Date(expiresAt.getTime() - (OTP_EXPIRY_MINUTES * 60 * 1000) + (RESEND_COOLDOWN_SECONDS * 1000));
    
    if (now < cooldownEnd) {
      const waitTime = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
      return { 
        success: false, 
        message: `Please wait ${waitTime} seconds before requesting a new code` 
      };
    }
  }

  // Generate OTP code
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Send OTP based on method
  if (method === 'sms' && phoneNumber) {
    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new AppError('Invalid phone number format. Please use international format (e.g., +1234567890)', 400);
    }

    // Check if phone number is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: phoneNumber,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      throw new AppError('This phone number is already registered to another account', 409);
    }

    // Send SMS
    const sent = await sendTwilioOTP(phoneNumber, code);
    
    if (!sent) {
      throw new AppError('Failed to send verification code. Please try again later.', 500);
    }

    // Update user with verification code
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: phoneNumber,
        phoneVerificationCode: code,
        phoneVerificationExpiresAt: expiresAt,
      },
    });

    return { success: true, message: 'Verification code sent successfully' };
  }

  if (method === 'email' && email) {
    // Send email
    const sent = await sendEmail({
      to: email,
      subject: 'Your RentConnect Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Your Verification Code</h2>
            <p>Your RentConnect verification code is:</p>
            <h1 style="color: #4f46e5; letter-spacing: 4px; font-size: 32px;">${code}</h1>
            <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </body>
        </html>
      `,
    });

    if (!sent) {
      throw new AppError('Failed to send verification code. Please try again later.', 500);
    }

    // For email verification, we don't store the code in DB
    // Instead, we'd typically use a separate verification_tokens table
    // For simplicity, we'll skip this in the current implementation
    
    return { success: true, message: 'Verification code sent to email' };
  }

  throw new AppError('Invalid verification method', 400);
}

/**
 * Verify OTP code
 */
export async function verifyCode(request: VerifyOTPRequest): Promise<{ success: boolean; message: string }> {
  const { userId, code, type } = request;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      phoneVerified: true,
      phoneVerificationCode: true,
      phoneVerificationExpiresAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (type === 'phone') {
    // Check if already verified
    if (user.phoneVerified) {
      return { success: false, message: 'Phone number is already verified' };
    }

    // Check if code exists
    if (!user.phoneVerificationCode) {
      throw new AppError('No verification code found. Please request a new code.', 400);
    }

    // Check if code has expired
    if (user.phoneVerificationExpiresAt && new Date() > user.phoneVerificationExpiresAt) {
      throw new AppError('Verification code has expired. Please request a new code.', 400);
    }

    // Verify code
    if (code !== user.phoneVerificationCode) {
      throw new AppError('Invalid verification code', 400);
    }

    // Mark phone as verified and clear the code
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiresAt: null,
      },
    });

    return { success: true, message: 'Phone number verified successfully' };
  }

  if (type === 'email') {
    // Email verification would typically use a token-based approach
    // For now, we'll skip this implementation detail
    throw new AppError('Email verification not implemented via OTP', 501);
  }

  throw new AppError('Invalid verification type', 400);
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(userId: string, method: 'sms' | 'email'): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (method === 'sms') {
    if (!user.phone) {
      throw new AppError('No phone number associated with this account', 400);
    }
    return sendVerificationCode({ userId, phoneNumber: user.phone, method: 'sms' });
  }

  if (method === 'email') {
    return sendVerificationCode({ userId, email: user.email, method: 'email' });
  }

  throw new AppError('Invalid verification method', 400);
}
