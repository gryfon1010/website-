import type {
  BookingDetails,
  ConversationSummary,
  Dispute,
  ListingSummary,
  Notification,
  User,
} from "@shared/contracts";
import type { Prisma } from "@prisma/client";

export function serializeUser(user: Prisma.UserGetPayload<Record<string, never>>): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? "",
    location: user.location ?? "",
    bio: user.bio ?? "",
    avatar: user.avatar ?? "",
    verificationStatus: user.verificationStatus.toLowerCase() as User["verificationStatus"],
    rating: user.rating,
    reviewCount: user.reviewCount,
    trustScore: user.trustScore,
    joinedAt: user.createdAt.toISOString(),
    role: user.role.toLowerCase() as User["role"],
  };
}

export function serializeListingSummary(
  item: Prisma.ItemGetPayload<{
    include: { owner: true; reviews: true };
  }>,
  distanceKm = 0,
): ListingSummary {
  const averageRating = item.reviews.length
    ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length
    : item.owner.rating;

  return {
    id: item.id,
    ownerId: item.ownerId,
    title: item.title,
    category: item.category,
    description: item.description,
    pricePerDay: item.pricePerDay,
    location: item.location,
    images: item.images,
    features: item.features,
    insuranceEnabled: item.insuranceEnabled,
    cancellationPolicy: item.cancellationPolicy,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    owner: {
      id: item.owner.id,
      name: item.owner.name,
      avatar: item.owner.avatar ?? "",
      rating: item.owner.rating,
      reviewCount: item.owner.reviewCount,
      trustScore: item.owner.trustScore,
      verificationStatus: item.owner.verificationStatus.toLowerCase() as User["verificationStatus"],
    },
    rating: Number(averageRating.toFixed(1)),
    reviewCount: item.reviews.length,
    distanceKm,
  };
}

export function serializeBookingDetails(
  booking: Prisma.BookingGetPayload<{
    include: {
      item: { include: { owner: true; reviews: true } };
      owner: true;
      renter: true;
    };
  }>,
  distanceKm = 0,
): BookingDetails {
  return {
    id: booking.id,
    itemId: booking.itemId,
    ownerId: booking.ownerId,
    renterId: booking.renterId,
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString(),
    quantity: booking.quantity,
    dayCount: booking.dayCount,
    subtotal: booking.subtotal,
    serviceFee: booking.serviceFee,
    damageWaiver: booking.damageWaiver,
    totalPrice: booking.totalPrice,
    status: booking.status.toLowerCase() as BookingDetails["status"],
    paymentStatus: booking.paymentStatus.toLowerCase() as BookingDetails["paymentStatus"],
    createdAt: booking.createdAt.toISOString(),
    item: serializeListingSummary(booking.item, distanceKm),
    owner: {
      id: booking.owner.id,
      name: booking.owner.name,
      avatar: booking.owner.avatar ?? "",
      rating: booking.owner.rating,
      reviewCount: booking.owner.reviewCount,
      verificationStatus: booking.owner.verificationStatus.toLowerCase() as User["verificationStatus"],
    },
    renter: {
      id: booking.renter.id,
      name: booking.renter.name,
      avatar: booking.renter.avatar ?? "",
    },
  };
}

export function serializeConversationSummary(
  conversation: Prisma.ConversationGetPayload<{
    include: {
      item: true;
      participants: { include: { user: true } };
      messages: { orderBy: { createdAt: "desc" }; take: 1 };
    };
  }>,
  unreadCount: number,
): ConversationSummary {
  return {
    id: conversation.id,
    itemId: conversation.itemId,
    itemTitle: conversation.item.title,
    itemImage: conversation.item.images[0] ?? "",
    participants: conversation.participants.map((participant) => ({
      id: participant.user.id,
      name: participant.user.name,
      avatar: participant.user.avatar ?? "",
    })),
    lastMessage: conversation.messages[0]
      ? {
          id: conversation.messages[0].id,
          conversationId: conversation.messages[0].conversationId,
          senderId: conversation.messages[0].senderId,
          content: conversation.messages[0].content,
          createdAt: conversation.messages[0].createdAt.toISOString(),
        }
      : undefined,
    unreadCount,
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export function serializeNotification(notification: Prisma.NotificationGetPayload<Record<string, never>>): Notification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type.toLowerCase() as Notification["type"],
    title: notification.title,
    body: notification.body,
    href: notification.href ?? undefined,
    read: Boolean(notification.readAt),
    createdAt: notification.createdAt.toISOString(),
  };
}

export function serializeDispute(dispute: Prisma.DisputeGetPayload<Record<string, never>>): Dispute {
  return {
    id: dispute.id,
    bookingId: dispute.bookingId,
    itemId: dispute.itemId,
    openedById: dispute.openedById,
    renterId: dispute.renterId,
    ownerId: dispute.ownerId,
    title: dispute.title,
    description: dispute.description,
    evidenceUrls: dispute.evidenceUrls,
    status: dispute.status.toLowerCase() as Dispute["status"],
    resolution: dispute.resolution,
    createdAt: dispute.createdAt.toISOString(),
    updatedAt: dispute.updatedAt.toISOString(),
  };
}
