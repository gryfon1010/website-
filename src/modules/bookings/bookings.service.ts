import { prisma } from "@server/database/prisma";
import { AppError } from "@server/utils/app-error";
import { serializeBookingDetails } from "@server/services/serializers";
import { createNotification } from "@server/services/notification.service";
import { recalculateUserTrustScore } from "@server/services/trust-score.service";
import { bookingExpiryQueue, paymentReleaseQueue } from "@server/queues";

function daysBetween(startDate: Date, endDate: Date) {
  return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
}

export async function createBooking(renterId: string, input: { itemId: string; startDate: string; endDate: string; quantity: number }) {
  const item = await prisma.item.findUnique({
    where: { id: input.itemId },
    include: { owner: true, reviews: true },
  });
  if (!item || !item.isActive) {
    throw new AppError("Listing not found.", 404);
  }
  if (item.ownerId === renterId) {
    throw new AppError("You cannot book your own listing.", 400);
  }

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (endDate <= startDate) {
    throw new AppError("End date must be after start date.", 400);
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      itemId: item.id,
      status: { not: "CANCELLED" },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });

  if (conflict) {
    throw new AppError("Listing is unavailable for the selected dates.", 409);
  }

  const dayCount = daysBetween(startDate, endDate);
  const subtotal = item.pricePerDay * dayCount * input.quantity;
  const serviceFee = Math.round(subtotal * 0.08);
  const damageWaiver = item.insuranceEnabled ? dayCount * 5 : 0;

  const booking = await prisma.booking.create({
    data: {
      itemId: item.id,
      ownerId: item.ownerId,
      renterId,
      startDate,
      endDate,
      quantity: input.quantity,
      dayCount,
      subtotal,
      serviceFee,
      damageWaiver,
      totalPrice: subtotal + serviceFee + damageWaiver,
    },
    include: {
      item: { include: { owner: true, reviews: true } },
      owner: true,
      renter: true,
    },
  });

  await bookingExpiryQueue?.add("expire-booking", { bookingId: booking.id }, { delay: 15 * 60 * 1000 });
  await createNotification({
    userId: item.ownerId,
    type: "BOOKING",
    title: "New booking request",
    body: `${booking.renter.name} requested ${item.title}.`,
    href: `/bookings/${booking.id}/confirmation`,
  });

  return serializeBookingDetails(booking);
}

export async function listBookings(userId: string, role: "owner" | "renter") {
  const bookings = await prisma.booking.findMany({
    where: role === "owner" ? { ownerId: userId } : { renterId: userId },
    include: {
      item: { include: { owner: true, reviews: true } },
      owner: true,
      renter: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return bookings.map((booking) => serializeBookingDetails(booking));
}

export async function getBookingById(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [{ ownerId: userId }, { renterId: userId }],
    },
    include: {
      item: { include: { owner: true, reviews: true } },
      owner: true,
      renter: true,
    },
  });
  if (!booking) throw new AppError("Booking not found.", 404);
  return serializeBookingDetails(booking);
}

async function updateBookingStatus(input: {
  bookingId: string;
  actorId: string;
  status: "CONFIRMED" | "CANCELLED" | "ACTIVE" | "COMPLETED";
}) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: input.bookingId,
      OR: [{ ownerId: input.actorId }, { renterId: input.actorId }],
    },
    include: {
      item: { include: { owner: true, reviews: true } },
      owner: true,
      renter: true,
    },
  });
  if (!booking) throw new AppError("Booking not found.", 404);

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: input.status,
      paymentStatus: input.status === "CANCELLED" ? "CANCELLED" : booking.paymentStatus,
    },
    include: {
      item: { include: { owner: true, reviews: true } },
      owner: true,
      renter: true,
    },
  });

  if (input.status === "COMPLETED") {
    await paymentReleaseQueue?.add("release-payment", { bookingId: booking.id }, { delay: 0 });
    await createNotification({
      userId: updated.renterId,
      type: "BOOKING",
      title: "Leave a review",
      body: `Your rental for ${updated.item.title} is complete.`,
      href: `/bookings/${updated.id}/confirmation`,
    });
    await Promise.all([recalculateUserTrustScore(updated.ownerId), recalculateUserTrustScore(updated.renterId)]);
  }

  const recipientId = updated.ownerId === input.actorId ? updated.renterId : updated.ownerId;
  await createNotification({
    userId: recipientId,
    type: "BOOKING",
    title: `Booking ${input.status.toLowerCase()}`,
    body: `${updated.item.title} is now ${input.status.toLowerCase()}.`,
    href: `/bookings/${updated.id}/confirmation`,
  });

  return serializeBookingDetails(updated);
}

export async function confirmBooking(actorId: string, bookingId: string) {
  return updateBookingStatus({ actorId, bookingId, status: "CONFIRMED" });
}

export async function cancelBooking(actorId: string, bookingId: string) {
  return updateBookingStatus({ actorId, bookingId, status: "CANCELLED" });
}

export async function startBooking(actorId: string, bookingId: string) {
  return updateBookingStatus({ actorId, bookingId, status: "ACTIVE" });
}

export async function completeBooking(actorId: string, bookingId: string) {
  return updateBookingStatus({ actorId, bookingId, status: "COMPLETED" });
}

export async function createReview(actorId: string, input: { bookingId: string; rating: number; comment: string }) {
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, renterId: actorId, status: "COMPLETED" },
  });
  if (!booking) throw new AppError("Completed booking not found.", 404);

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      itemId: booking.itemId,
      authorId: actorId,
      targetUserId: booking.ownerId,
      rating: input.rating,
      comment: input.comment,
    },
  });

  await recalculateUserTrustScore(booking.ownerId);
  return {
    id: review.id,
    itemId: review.itemId,
    bookingId: review.bookingId,
    authorId: review.authorId,
    targetUserId: review.targetUserId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}
