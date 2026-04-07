import { Router } from "express";
import { prisma } from "@server/database/prisma";
import { requireAuth, type AuthenticatedRequest } from "@server/middleware/auth";
import { asyncHandler } from "@server/utils/async-handler";
import { serializeBookingDetails, serializeConversationSummary, serializeListingSummary, serializeNotification } from "@server/services/serializers";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.auth!.sub;
    const [listings, bookings, conversations, notifications] = await Promise.all([
      prisma.item.findMany({
        where: { ownerId: userId },
        include: { owner: true, reviews: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        where: {
          OR: [{ ownerId: userId }, { renterId: userId }],
        },
        include: {
          item: { include: { owner: true, reviews: true } },
          owner: true,
          renter: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.conversation.findMany({
        where: {
          participants: { some: { userId } },
        },
        include: {
          item: true,
          participants: { include: { user: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const conversationSummaries = await Promise.all(
      conversations.map(async (conversation) => {
        const selfParticipant = conversation.participants.find((participant) => participant.userId === userId);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            createdAt: selfParticipant?.lastReadAt ? { gt: selfParticipant.lastReadAt } : undefined,
          },
        });

        return serializeConversationSummary(
          {
            ...conversation,
            participants: conversation.participants.filter((participant) => participant.userId !== userId),
          },
          unreadCount,
        );
      }),
    );

    res.json({
      stats: {
        totalEarnings: bookings
          .filter((booking) => booking.ownerId === userId && booking.paymentStatus === "PAID")
          .reduce((sum, booking) => sum + booking.totalPrice, 0),
        activeListings: listings.filter((listing) => listing.isActive).length,
        totalBookings: bookings.length,
        unreadMessages: conversationSummaries.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
      },
      listings: listings.map((listing) => serializeListingSummary(listing)),
      bookings: bookings.map((booking) => serializeBookingDetails(booking)),
      conversations: conversationSummaries,
      notifications: notifications.map(serializeNotification),
    });
  }),
);
