import Stripe from 'stripe';
import { env } from '@server/config/env';
import { prisma } from '@server/database/prisma';
import { AppError } from '@server/utils/app-error';
import { logger } from '@server/utils/logger';

// Initialize Stripe with Connect support
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

/**
 * Create a Stripe Connect account for an owner
 */
export async function createConnectAccount(userId: string, email: string): Promise<{
  accountId: string;
  onboardingUrl: string;
}> {
  try {
    // Check if user already has a connect account
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeConnectAccountId: true },
    });

    if (existingUser?.stripeConnectAccountId) {
      throw new AppError('User already has a Stripe Connect account', 400);
    }

    // Create Express Connect account (recommended for marketplaces)
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: userId,
        platform: 'RentConnect',
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${env.CLIENT_URL}/dashboard/payouts?refresh=true`,
      return_url: `${env.CLIENT_URL}/dashboard/payouts?success=true`,
      type: 'account_onboarding',
      collection_options: {
        fields: 'eventually_due',
      },
    });

    // Save account ID to database
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeConnectAccountId: account.id,
        stripeConnectAccountCreated: true,
      },
    });

    logger.info(`Stripe Connect account created for user ${userId}: ${account.id}`);

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    logger.error('Failed to create Stripe Connect account:', error);
    throw new AppError('Failed to create payment account. Please try again.', 500);
  }
}

/**
 * Get Connect account status and details
 */
export async function getConnectAccountStatus(userId: string): Promise<{
  isOnboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requiresInformation: boolean;
  detailsSubmitted: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeConnectAccountId: true },
  });

  if (!user?.stripeConnectAccountId) {
    return {
      isOnboarded: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      requiresInformation: true,
      detailsSubmitted: false,
    };
  }

  try {
    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);

    return {
      isOnboarded: account.details_submitted ?? false,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      requiresInformation: !account.details_submitted || (account.requirements?.currently_due?.length ?? 0) > 0,
      detailsSubmitted: account.details_submitted ?? false,
    };
  } catch (error) {
    logger.error('Failed to get Connect account status:', error);
    return {
      isOnboarded: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      requiresInformation: true,
      detailsSubmitted: false,
    };
  }
}

/**
 * Create a checkout session with automatic split of funds
 */
export async function createConnectCheckoutSession(
  bookingId: string,
  renterId: string
): Promise<{
  sessionId: string;
  checkoutUrl: string;
  publishableKey: string;
}> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { item: true },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.renterId !== renterId) {
    throw new AppError('Unauthorized access to booking', 403);
  }

  // Get owner's Connect account
  const owner = await prisma.user.findUnique({
    where: { id: booking.ownerId },
    select: { stripeConnectAccountId: true, email: true },
  });

  if (!owner?.stripeConnectAccountId) {
    throw new AppError('Owner has not set up payments yet', 400);
  }

  // Calculate platform fee (e.g., 8%)
  const platformFeePercent = 0.08;
  const platformFee = Math.round(booking.totalPrice * platformFeePercent);
  const ownerAmount = booking.totalPrice - platformFee;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${env.CLIENT_URL}/checkout/success?sessionId={CHECKOUT_SESSION_ID}&bookingId=${booking.id}`,
      cancel_url: `${env.CLIENT_URL}/items/${booking.itemId}`,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: booking.item.title,
              description: `${booking.dayCount} days rental`,
              images: booking.item.images.slice(0, 1),
            },
            unit_amount: booking.totalPrice * 100, // Convert to pence
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: owner.stripeConnectAccountId,
          amount: ownerAmount * 100, // Amount for owner in pence
        },
        application_fee_amount: platformFee * 100, // Platform fee in pence
      },
      metadata: {
        bookingId: booking.id,
        itemId: booking.itemId,
        renterId: booking.renterId,
        ownerId: booking.ownerId,
        platformFee: platformFee.toString(),
        ownerAmount: ownerAmount.toString(),
      },
    });

    // Update or create payment record
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        provider: 'STRIPE',
        stripeCheckoutSessionId: session.id,
        amount: booking.totalPrice,
        currency: 'gbp',
        status: 'PENDING',
      },
      update: {
        stripeCheckoutSessionId: session.id,
        amount: booking.totalPrice,
        currency: 'gbp',
        status: 'PENDING',
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url ?? '',
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    };
  } catch (error) {
    logger.error('Failed to create Connect checkout session:', error);
    throw new AppError('Failed to create payment session', 500);
  }
}

/**
 * Process payout to owner (manual or scheduled)
 */
export async function processPayout(
  ownerId: string,
  amount: number,
  bookingId?: string
): Promise<{
  payoutId: string;
  status: string;
  estimatedArrival: Date;
}> {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { stripeConnectAccountId: true },
  });

  if (!owner?.stripeConnectAccountId) {
    throw new AppError('Owner does not have a valid Connect account', 400);
  }

  try {
    // Create transfer to Connect account
    const transfer = await stripe.transfers.create({
      amount: amount * 100, // Convert to pence
      currency: 'gbp',
      destination: owner.stripeConnectAccountId,
      source_transaction: bookingId ? await getPaymentIntentId(bookingId) : undefined,
      metadata: {
        ownerId: ownerId,
        bookingId: bookingId || '',
        platform: 'RentConnect',
      },
    });

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        ownerId: ownerId,
        amount: amount,
        status: 'PROCESSING',
        stripeId: transfer.id,
        metadata: {
          transferId: transfer.id,
          bookingId: bookingId || null,
        },
      },
    });

    logger.info(`Payout processed for owner ${ownerId}: £${amount} (${transfer.id})`);

    return {
      payoutId: payout.id,
      status: 'PROCESSING',
      estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 business days
    };
  } catch (error) {
    logger.error('Failed to process payout:', error);
    throw new AppError('Failed to process payout', 500);
  }
}

/**
 * Process refund for a booking
 */
export async function processRefund(
  bookingId: string,
  amount?: number,
  reason?: string
): Promise<{
  refundId: string;
  status: string;
  amount: number;
}> {
  const payment = await prisma.payment.findFirst({
    where: { bookingId: bookingId },
    select: { stripePaymentIntentId: true, amount: true, status: true },
  });

  if (!payment?.stripePaymentIntentId) {
    throw new AppError('No valid payment found for this booking', 404);
  }

  if (payment.status === 'CANCELLED' || payment.status === 'FAILED') {
    throw new AppError('Payment was not successful', 400);
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount ? amount * 100 : undefined, // Full refund if not specified
      reason: reason || 'requested_by_customer',
      metadata: {
        bookingId: bookingId,
        platform: 'RentConnect',
      },
    });

    // Update payment record
    await prisma.payment.update({
      where: { bookingId: bookingId },
      data: {
        status: 'CANCELLED',
        refundedAt: new Date(),
      },
    });

    logger.info(`Refund processed for booking ${bookingId}: £${amount || payment.amount}`);

    return {
      refundId: refund.id,
      status: refund.status,
      amount: amount || payment.amount,
    };
  } catch (error) {
    logger.error('Failed to process refund:', error);
    throw new AppError('Failed to process refund', 500);
  }
}

/**
 * Handle Stripe Connect webhooks
 */
export async function handleConnectWebhook(
  eventType: string,
  event: Stripe.Event
): Promise<void> {
  switch (eventType) {
    case 'account.updated':
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;
    case 'account.onboarding.finished':
      await handleAccountOnboardingFinished(event.data.object as Stripe.Account);
      break;
    case 'payout.created':
    case 'payout.paid':
    case 'payout.failed':
      await handlePayoutEvent(eventType, event.data.object as Stripe.Payout);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    default:
      logger.info(`Unhandled Connect event type: ${eventType}`);
  }
}

/**
 * Handle account updated webhook
 */
async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  const userId = account.metadata?.userId;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeConnectAccountCreated: true,
    },
  });

  logger.info(`Connect account updated for user ${userId}`);
}

/**
 * Handle account onboarding finished webhook
 */
async function handleAccountOnboardingFinished(account: Stripe.Account): Promise<void> {
  const userId = account.metadata?.userId;
  if (!userId) return;

  // Send welcome email/notification
  logger.info(`Connect account onboarding completed for user ${userId}`);
}

/**
 * Handle payout events
 */
async function handlePayoutEvent(
  eventType: string,
  payout: Stripe.Payout
): Promise<void> {
  const payoutRecord = await prisma.payout.findFirst({
    where: { stripeId: payout.id },
  });

  if (!payoutRecord) return;

  const status =
    eventType === 'payout.paid'
      ? 'COMPLETED'
      : eventType === 'payout.failed'
      ? 'FAILED'
      : 'PROCESSING';

  await prisma.payout.update({
    where: { id: payoutRecord.id },
    data: {
      status: status,
      processedAt: status === 'COMPLETED' ? new Date() : undefined,
    },
  });

  logger.info(`Payout ${status.toLowerCase()}: ${payoutRecord.id}`);
}

/**
 * Handle charge refunded event
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  if (!charge.payment_intent || typeof charge.payment_intent !== 'string') return;

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: charge.payment_intent },
  });

  if (!payment) return;

  await prisma.payment.update({
    where: { bookingId: payment.bookingId },
    data: {
      status: 'CANCELLED',
      refundedAt: new Date(),
    },
  });

  logger.info(`Charge refunded: ${payment.bookingId}`);
}

/**
 * Helper: Get payment intent ID for a booking
 */
async function getPaymentIntentId(bookingId: string): Promise<string | undefined> {
  const payment = await prisma.payment.findFirst({
    where: { bookingId: bookingId },
    select: { stripePaymentIntentId: true },
  });
  return payment?.stripePaymentIntentId;
}

/**
 * Get owner's payout balance (pending earnings)
 */
export async function getOwnerBalance(ownerId: string): Promise<{
  pendingBalance: number;
  availableBalance: number;
  totalEarnings: number;
}> {
  const bookings = await prisma.booking.findMany({
    where: { ownerId: ownerId },
    select: {
      totalPrice: true,
      paymentStatus: true,
      status: true,
      paymentReleaseAt: true,
    },
  });

  const pendingBalance = bookings
    .filter((b) => b.paymentStatus === 'PAID' && b.status === 'COMPLETED' && !b.paymentReleaseAt)
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const availableBalance = bookings
    .filter((b) => b.paymentStatus === 'PAID' && b.status === 'COMPLETED' && b.paymentReleaseAt && b.paymentReleaseAt <= new Date())
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalEarnings = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Subtract platform fees (8%)
  const platformFeePercent = 0.08;

  return {
    pendingBalance: Math.round(pendingBalance * (1 - platformFeePercent)),
    availableBalance: Math.round(availableBalance * (1 - platformFeePercent)),
    totalEarnings: Math.round(totalEarnings * (1 - platformFeePercent)),
  };
}
