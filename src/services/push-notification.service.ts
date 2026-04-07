import webPush from 'web-push';
import { prisma } from '@server/database/prisma';
import { logger } from '@server/utils/logger';
import { env } from '@server/config/env';

// Initialize VAPID keys for web push
const VAPID_KEYS = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

if (VAPID_KEYS.publicKey && VAPID_KEYS.privateKey) {
  webPush.setVapidDetails(
    'mailto:support@rentconnect.app',
    VAPID_KEYS.publicKey,
    VAPID_KEYS.privateKey
  );
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Generate VAPID keys (run once to generate)
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  const keys = webPush.generateVAPIDKeys();
  return {
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
  };
}

/**
 * Save push subscription for user
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<void> {
  try {
    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findFirst({
      where: {
        userId: userId,
        endpoint: subscription.endpoint,
      },
    });

    if (!existing) {
      await prisma.pushSubscription.create({
        data: {
          userId: userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys as any,
        },
      });
      logger.info(`Push subscription saved for user ${userId}`);
    }
  } catch (error) {
    logger.error('Failed to save push subscription:', error);
  }
}

/**
 * Remove push subscription
 */
export async function removePushSubscription(
  userId: string,
  endpoint: string
): Promise<void> {
  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: userId,
        endpoint: endpoint,
      },
    });
    logger.info(`Push subscription removed for user ${userId}`);
  } catch (error) {
    logger.error('Failed to remove push subscription:', error);
  }
}

/**
 * Send push notification to single user
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: userId },
    });

    if (subscriptions.length === 0) {
      logger.debug(`No push subscriptions for user ${userId}`);
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-192.png',
      data: payload.data,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction ?? false,
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: (sub.keys as any).p256dh,
              auth: (sub.keys as any).auth,
            },
          } as any,
          notificationPayload
        );
        logger.debug(`Push notification sent to user ${userId}`);
      } catch (error: any) {
        if (error.statusCode === 410) {
          // Subscription expired, remove it
          await removePushSubscription(userId, sub.endpoint);
        } else {
          logger.error(`Failed to send push to user ${userId}:`, error);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    logger.error('Failed to send push notifications:', error);
  }
}

/**
 * Send push notification to multiple users
 */
export async function broadcastPushNotification(
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: { in: userIds },
      },
    });

    logger.info(`Broadcasting push notification to ${subscriptions.length} subscriptions`);

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: (sub.keys as any).p256dh,
              auth: (sub.keys as any).auth,
            },
          } as any,
          JSON.stringify(payload)
        );
      } catch (error: any) {
        if (error.statusCode === 410) {
          await removePushSubscription(sub.userId, sub.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    logger.error('Failed to broadcast push notification:', error);
  }
}

/**
 * Create and send notification (multi-channel)
 */
export async function createAndSendNotification(
  input: {
    userId: string;
    type: 'BOOKING' | 'MESSAGE' | 'PAYMENT' | 'SYSTEM' | 'DISPUTE';
    title: string;
    body: string;
    href?: string;
    sendPush?: boolean;
    sendEmail?: boolean;
    sendSMS?: boolean;
  }
): Promise<void> {
  const { userId, type, title, body, href, sendPush = true, sendEmail = false, sendSMS = false } = input;

  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        href,
      },
    });

    logger.info(`Created notification for user ${userId}: ${title}`);

    // Send push notification
    if (sendPush) {
      await sendPushNotification(userId, {
        title,
        body,
        data: {
          type,
          href,
          notificationId: notification.id,
        },
        tag: `rentconnect-${type.toLowerCase()}-${Date.now()}`,
      });
    }

    // Send email if requested
    if (sendEmail) {
      // Import dynamically to avoid circular dependency
      const { sendEmail: sendEmailService } = await import('./email.service');
      await sendEmailService({
        to: await getUserEmail(userId),
        subject: `RentConnect: ${title}`,
        html: `<h2>${title}</h2><p>${body}</p>`,
      });
    }

    // Send SMS if requested (for urgent notifications only)
    if (sendSMS) {
      const { sendOTP } = await import('./sms.service');
      const userPhone = await getUserPhone(userId);
      if (userPhone) {
        await sendOTP(userPhone, `RentConnect: ${title}. ${body}`);
      }
    }
  } catch (error) {
    logger.error('Failed to create notification:', error);
  }
}

/**
 * Get user's email for notification
 */
async function getUserEmail(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email || '';
}

/**
 * Get user's phone for notification
 */
async function getUserPhone(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true, phoneVerified: true },
  });
  return user?.phoneVerified ? user.phone : null;
}

/**
 * Send booking notification
 */
export async function sendBookingNotification(
  userId: string,
  bookingTitle: string,
  status: string,
  href: string
): Promise<void> {
  await createAndSendNotification({
    userId,
    type: 'BOOKING',
    title: `Booking ${status}`,
    body: `Your booking "${bookingTitle}" has been ${status.toLowerCase()}.`,
    href,
    sendPush: true,
    sendEmail: true,
  });
}

/**
 * Send payment notification
 */
export async function sendPaymentNotification(
  userId: string,
  amount: number,
  description: string,
  status: string
): Promise<void> {
  await createAndSendNotification({
    userId,
    type: 'PAYMENT',
    title: `Payment ${status}`,
    body: `${description}: £${amount}`,
    href: '/dashboard/payments',
    sendPush: true,
    sendEmail: status === 'completed' || status === 'failed',
  });
}

/**
 * Send message notification
 */
export async function sendMessageNotification(
  userId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<void> {
  await createAndSendNotification({
    userId,
    type: 'MESSAGE',
    title: 'New Message',
    body: `${senderName}: ${messagePreview}`,
    href: `/dashboard/messages?conversationId=${conversationId}`,
    sendPush: true,
    sendEmail: false, // Don't send email for every message
  });
}

/**
 * Send dispute notification
 */
export async function sendDisputeNotification(
  userId: string,
  disputeTitle: string,
  status: string,
  href: string
): Promise<void> {
  await createAndSendNotification({
    userId,
    type: 'DISPUTE',
    title: `Dispute ${status}`,
    body: `Dispute "${disputeTitle}" has been ${status.toLowerCase()}.`,
    href,
    sendPush: true,
    sendEmail: true,
  });
}
