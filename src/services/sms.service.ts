import twilio from 'twilio';
import { env } from '@server/config/env';
import { logger } from '@server/utils/logger';

// Initialize Twilio client
const twilioClient = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Send SMS message
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  if (!twilioClient || !env.TWILIO_PHONE_NUMBER) {
    logger.warn('Twilio not configured, skipping SMS send');
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const messageInstance = await twilioClient.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    logger.info('SMS sent successfully:', messageInstance.sid);
    return true;
  } catch (error) {
    logger.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Send OTP verification code via SMS
 */
export async function sendOTP(phoneNumber: string, code: string): Promise<boolean> {
  const message = `Your RentConnect verification code is: ${code}. This code will expire in 10 minutes. Do not share this code with anyone.`;
  return sendSMS(phoneNumber, message);
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  // Generate a cryptographically secure random 6-digit code
  const digits = '0123456789';
  let otp = '';
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use Web Crypto API for secure random generation
    const randomValues = new Uint32Array(6);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < 6; i++) {
      otp += digits[randomValues[i] % 10];
    }
  } else {
    // Fallback to Math.random (less secure but works in all environments)
    for (let i = 0; i < 6; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
  }
  
  return otp;
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, assume it's a US number and add +1
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Basic validation for international format
  // Should start with + followed by 10-15 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  
  if (phoneRegex.test(cleaned)) {
    return true;
  }
  
  // Also accept US numbers without +
  const usPhoneRegex = /^(\+1)?[2-9]\d{9}$/;
  return usPhoneRegex.test(cleaned);
}
