import { prisma } from "@server/database/prisma";
import { AppError } from "@server/utils/app-error";
import { serializeDispute } from "@server/services/serializers";
import { createNotification } from "@server/services/notification.service";

export async function listDisputes(userId: string) {
  const disputes = await prisma.dispute.findMany({
    where: {
      OR: [{ ownerId: userId }, { renterId: userId }, { openedById: userId }],
    },
    orderBy: { createdAt: "desc" },
  });
  return disputes.map(serializeDispute);
}

export async function createDispute(
  userId: string,
  input: { bookingId: string; title: string; description: string; evidenceUrls: string[] },
) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: input.bookingId,
      OR: [{ ownerId: userId }, { renterId: userId }],
    },
  });

  if (!booking) throw new AppError("Booking not found.", 404);

  const dispute = await prisma.dispute.create({
    data: {
      bookingId: booking.id,
      itemId: booking.itemId,
      openedById: userId,
      renterId: booking.renterId,
      ownerId: booking.ownerId,
      title: input.title,
      description: input.description,
      evidenceUrls: input.evidenceUrls,
    },
  });

  const counterpartId = booking.ownerId === userId ? booking.renterId : booking.ownerId;
  await createNotification({
    userId: counterpartId,
    type: "DISPUTE",
    title: "Dispute opened",
    body: input.title,
    href: "/dashboard?tab=notifications",
  });

  return serializeDispute(dispute);
}

export async function updateDispute(
  userId: string,
  disputeId: string,
  input: { status: "open" | "under_review" | "resolved" | "closed"; resolution?: string },
) {
  const dispute = await prisma.dispute.findFirst({
    where: {
      id: disputeId,
      OR: [{ ownerId: userId }, { renterId: userId }],
    },
  });
  if (!dispute) throw new AppError("Dispute not found.", 404);

  const updated = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: input.status.toUpperCase() as "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED",
      resolution: input.resolution,
    },
  });

  const recipients = [updated.ownerId, updated.renterId].filter((id, index, array) => array.indexOf(id) === index);
  await Promise.all(
    recipients.map((recipientId) =>
      createNotification({
        userId: recipientId,
        type: "DISPUTE",
        title: "Dispute updated",
        body: `${updated.title} is now ${input.status.replace("_", " ")}.`,
        href: "/dashboard?tab=notifications",
      }),
    ),
  );

  return serializeDispute(updated);
}
