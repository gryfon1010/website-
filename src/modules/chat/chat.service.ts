import { prisma } from "@server/database/prisma";
import { AppError } from "@server/utils/app-error";
import { serializeConversationSummary } from "@server/services/serializers";
import { createNotification } from "@server/services/notification.service";
import { getIo } from "@server/sockets";

export async function listConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      item: true,
      participants: {
        include: { user: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return Promise.all(conversations.map(async (conversation) => {
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
  }));
}

export async function createConversation(userId: string, itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new AppError("Listing not found.", 404);
  const participantIds = [userId, item.ownerId].sort();

  const existing = await prisma.conversation.findFirst({
    where: {
      itemId,
      participants: {
        every: {
          userId: { in: participantIds },
        },
      },
    },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      itemId,
      participants: {
        create: participantIds.map((participantId) => ({
          userId: participantId,
        })),
      },
    },
  });
}

export async function getConversationMessages(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId } },
    },
  });
  if (!conversation) throw new AppError("Conversation not found.", 404);

  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((message) => ({
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  }));
}

export async function sendConversationMessage(userId: string, conversationId: string, content: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId } },
    },
    include: {
      participants: true,
    },
  });
  if (!conversation) throw new AppError("Conversation not found.", 404);

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: message.createdAt },
  });

  const payload = {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };

  for (const participant of conversation.participants) {
    if (participant.userId === userId) continue;
    await createNotification({
      userId: participant.userId,
      type: "MESSAGE",
      title: "New message",
      body: content,
      href: `/dashboard?tab=messages&conversationId=${conversationId}`,
    });
  }

  getIo().to(`conversation:${conversationId}`).emit("message:new", payload);
  return payload;
}

export async function markConversationRead(userId: string, conversationId: string) {
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}
