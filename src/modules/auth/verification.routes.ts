import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '@server/middleware/auth';
import { validate } from '@server/middleware/validate';
import { asyncHandler } from '@server/utils/async-handler';
import { z } from 'zod';
import { sendVerificationCode, verifyCode, resendVerificationCode } from '@server/services/otp.service';
import { 
  setupTwoFactorAuthentication, 
  enableTwoFactorAuthentication, 
  disableTwoFactorAuthentication,
  regenerateBackupCodes 
} from '@server/services/2fa.service';
import { AppError } from '@server/utils/app-error';

export const verificationRouter = Router();

// Schema for sending verification code
const sendVerificationSchema = z.object({
  method: z.enum(['sms', 'email']),
  phoneNumber: z.string().optional(),
});

// Schema for verifying code
const verifyCodeSchema = z.object({
  code: z.string().min(1).max(10),
  type: z.enum(['phone', 'email']),
});

/**
 * POST /verification/send
 * Send verification code via SMS or email
 */
verificationRouter.post(
  '/send',
  requireAuth,
  validate({ body: sendVerificationSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { method, phoneNumber } = req.body;
    
    // For SMS, phone number is required
    if (method === 'sms' && !phoneNumber) {
      throw new AppError('Phone number is required for SMS verification', 400);
    }

    const result = await sendVerificationCode({
      userId: req.auth!.sub,
      phoneNumber,
      method,
    });

    res.json(result);
  })
);

/**
 * POST /verification/verify
 * Verify the code entered by user
 */
verificationRouter.post(
  '/verify',
  requireAuth,
  validate({ body: verifyCodeSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { code, type } = req.body;

    const result = await verifyCode({
      userId: req.auth!.sub,
      code,
      type,
    });

    res.json(result);
  })
);

/**
 * POST /verification/resend
 * Resend verification code
 */
verificationRouter.post(
  '/resend',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const method = req.body.method || 'sms';
    
    const result = await resendVerificationCode(req.auth!.sub, method);

    res.json(result);
  })
);

// 2FA Routes

const setup2FASchema = z.object({});
const enable2FASchema = z.object({
  code: z.string().min(6).max(6),
});

const disable2FASchema = z.object({
  code: z.string().min(6).max(6).optional(),
  backupCode: z.string().optional(),
});

/**
 * POST /verification/2fa/setup
 * Setup two-factor authentication
 */
verificationRouter.post(
  '/2fa/setup',
  requireAuth,
  validate({ body: setup2FASchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await setupTwoFactorAuthentication(req.auth!.sub);

    res.json({
      success: true,
      ...result,
      message: 'Scan the QR code with your authenticator app',
    });
  })
);

/**
 * POST /verification/2fa/enable
 * Enable two-factor authentication after verification
 */
verificationRouter.post(
  '/2fa/enable',
  requireAuth,
  validate({ body: enable2FASchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { code } = req.body;

    const result = await enableTwoFactorAuthentication(req.auth!.sub, { code });

    res.json(result);
  })
);

/**
 * POST /verification/2fa/disable
 * Disable two-factor authentication
 */
verificationRouter.post(
  '/2fa/disable',
  requireAuth,
  validate({ body: disable2FASchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { code, backupCode } = req.body;

    const result = await disableTwoFactorAuthentication(req.auth!.sub, { code, backupCode });

    res.json(result);
  })
);

/**
 * POST /verification/2fa/backup-codes
 * Regenerate backup codes
 */
verificationRouter.post(
  '/2fa/backup-codes',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const backupCodes = await regenerateBackupCodes(req.auth!.sub);

    res.json({
      success: true,
      backupCodes,
      message: 'Backup codes regenerated. Store them in a safe place.',
    });
  })
);
