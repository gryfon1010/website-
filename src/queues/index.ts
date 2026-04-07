import { Queue, Worker } from "bullmq";
import { env } from "@server/config/env";
import { logger } from "@server/utils/logger";
import { prisma } from "@server/database/prisma";
import { createNotification } from "@server/services/notification.service";

const connection = env.QUEUE_ENABLED ? { connection: { url: env.REDIS_URL } } : null;

export const paymentReleaseQueue = connection ? new Queue("payment-release", connection) : null;
export const bookingExpiryQueue = connection ? new Queue("booking-expiry", connection) : null;
export const notificationQueue = connection ? new Queue("notification-delivery", connection) : null;

export function startQueueWorkers() {
  if (!connection) return;

  new Worker(
    "payment-release",
    async (job) => {
      const bookingId = job.data.bookingId as string;
      await prisma.payment.updateMany({
        where: { bookingId, status: "PAID" },
        data: { releasedAt: new Date() },
      });
    },
    connection,
  ).on("failed", (job, error) => logger.error(`payment-release failed ${job?.id}`, error));

  new Worker(
    "booking-expiry",
    async (job) => {
      const bookingId = job.data.bookingId as string;
      await prisma.booking.updateMany({
        where: { id: bookingId, status: "PENDING" },
        data: { status: "CANCELLED", paymentStatus: "CANCELLED" },
      });
    },
    connection,
  ).on("failed", (job, error) => logger.error(`booking-expiry failed ${job?.id}`, error));

  new Worker(
    "notification-delivery",
    async (job) => {
      await createNotification(job.data);
    },
    connection,
  ).on("failed", (job, error) => logger.error(`notification-delivery failed ${job?.id}`, error));
}
