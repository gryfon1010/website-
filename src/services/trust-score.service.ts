import { prisma } from "@server/database/prisma";

export async function recalculateUserTrustScore(userId: string) {
  const [user, completedRentals, receivedReviews] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.booking.count({
      where: {
        OR: [{ ownerId: userId }, { renterId: userId }],
        status: "COMPLETED",
      },
    }),
    prisma.review.findMany({
      where: { targetUserId: userId },
      select: { rating: true },
    }),
  ]);

  const averageRating = receivedReviews.length
    ? receivedReviews.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.length
    : 0;

  const base = user.verificationStatus === "VERIFIED" ? 45 : user.verificationStatus === "PENDING" ? 20 : 5;
  const rentalScore = Math.min(30, completedRentals * 2);
  const ratingScore = Math.round((averageRating / 5) * 25);
  const trustScore = Math.min(100, base + rentalScore + ratingScore);

  return prisma.user.update({
    where: { id: userId },
    data: {
      trustScore,
      rating: Number(averageRating.toFixed(2)),
      reviewCount: receivedReviews.length,
    },
  });
}
