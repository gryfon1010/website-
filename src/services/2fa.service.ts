import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '@server/database/prisma';
import { AppError } from '@server/utils/app-error';

const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface TwoFactorVerification {
  code: string;
  backupCode?: string;
}

/**
 * Generate a TOTP secret for 2FA setup
 */
export async function setupTwoFactorAuthentication(userId: string): Promise<TwoFactorSetup> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is already enabled', 400);
  }

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `RentConnect (${user.email})`,
    issuer: 'RentConnect',
    length: 32,
  });

  // Generate QR code URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  // Store secret temporarily (user needs to verify before it's activated)
  // We'll store it in a temporary field or use the existing field with a flag
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret.base32,
      twoFactorBackupCodes: backupCodes,
    },
  });

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Verify and enable 2FA
 */
export async function enableTwoFactorAuthentication(
  userId: string,
  verification: TwoFactorVerification
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorSecret: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is already enabled', 400);
  }

  if (!user.twoFactorSecret) {
    throw new AppError('2FA setup not initiated. Please scan QR code first', 400);
  }

  // Verify TOTP code
  const verified = verifyTOTP(user.twoFactorSecret, verification.code);

  if (!verified) {
    throw new AppError('Invalid verification code', 400);
  }

  // Enable 2FA
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
    },
  });

  return { success: true, message: 'Two-factor authentication enabled successfully' };
}

/**
 * Disable 2FA
 */
export async function disableTwoFactorAuthentication(
  userId: string,
  verification: TwoFactorVerification
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
      twoFactorSecret: true,
      twoFactorBackupCodes: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not enabled', 400);
  }

  // Verify either TOTP code or backup code
  let verified = false;

  if (verification.code) {
    verified = verifyTOTP(user.twoFactorSecret || '', verification.code);
  } else if (verification.backupCode && user.twoFactorBackupCodes.length > 0) {
    verified = verifyBackupCode(user.twoFactorBackupCodes, verification.backupCode);
    
    if (verified) {
      // Remove used backup code
      const remainingCodes = user.twoFactorBackupCodes.filter((storedCode: string) => storedCode !== verification.backupCode);
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: remainingCodes },
      });
    }
  }

  if (!verified) {
    throw new AppError('Invalid verification code or backup code', 400);
  }

  // Disable 2FA
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  return { success: true, message: 'Two-factor authentication disabled successfully' };
}

/**
 * Verify 2FA during login
 */
export async function verifyTwoFactorLogin(
  userId: string,
  verification: TwoFactorVerification
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
      twoFactorSecret: true,
      twoFactorBackupCodes: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If 2FA is not enabled, skip verification
  if (!user.twoFactorEnabled) {
    return true;
  }

  if (!user.twoFactorSecret) {
    throw new AppError('2FA is enabled but no secret found. Please contact support.', 500);
  }

  // Verify TOTP code
  if (verification.code) {
    const verified = verifyTOTP(user.twoFactorSecret, verification.code);
    if (verified) {
      return true;
    }
  }

  // Verify backup code
  if (verification.backupCode && user.twoFactorBackupCodes.length > 0) {
    const verified = verifyBackupCode(user.twoFactorBackupCodes, verification.backupCode);
    
    if (verified) {
      // Remove used backup code
      const remainingCodes = user.twoFactorBackupCodes.filter((storedCode: string) => storedCode !== verification.backupCode);
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: remainingCodes },
      });
      return true;
    }
  }

  return false;
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not enabled', 400);
  }

  const backupCodes = generateBackupCodes();

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorBackupCodes: backupCodes },
  });

  return backupCodes;
}

/**
 * Generate random backup codes
 */
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    let code = '';
    for (let j = 0; j < BACKUP_CODE_LENGTH; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Format as XXXX-XXXX for easier reading
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return codes;
}

/**
 * Verify TOTP code
 */
function verifyTOTP(secret: string, token: string): boolean {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after (covers clock skew)
    });
  } catch (error) {
    return false;
  }
}

/**
 * Verify backup code
 */
function verifyBackupCode(backupCodes: string[], code: string): boolean {
  // Normalize code (remove spaces, dashes, case-insensitive)
  const normalizedCode = code.replace(/[\s-]/g, '').toUpperCase();
  
  return backupCodes.some(storedCode => 
    storedCode.replace(/[\s-]/g, '') === normalizedCode
  );
}

/**
 * Check if user requires 2FA verification
 */
export async function requiresTwoFactor(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
    },
  });

  return user?.twoFactorEnabled ?? false;
}
