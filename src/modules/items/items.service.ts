import { prisma } from "@server/database/prisma";
import { getCache, invalidateCache, setCache } from "@server/services/cache.service";
import { serializeListingSummary, serializeUser } from "@server/services/serializers";
import { AppError } from "@server/utils/app-error";
import { getPagination, getPaginationMeta } from "@server/utils/pagination";

function distanceForLocation(from?: string | null, to?: string | null) {
  if (!from || !to) return 0;
  if (from.toLowerCase() === to.toLowerCase()) return 2;
  return Math.abs(Array.from(`${from}:${to}`).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 18) + 3;
}

export async function searchItems(input: {
  q?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  viewerId?: string;
}) {
  const cacheKey = `items:${JSON.stringify(input)}`;
  const cached = await getCache<unknown>(cacheKey);
  if (cached) return cached;

  const { page, limit, skip } = getPagination(input);
  const viewer = input.viewerId ? await prisma.user.findUnique({ where: { id: input.viewerId } }) : null;

  const where = {
    isActive: true,
    category: input.category || undefined,
    location: input.location ? { contains: input.location, mode: "insensitive" as const } : undefined,
    pricePerDay: {
      gte: input.minPrice,
      lte: input.maxPrice,
    },
    OR: input.q
      ? [
          { title: { contains: input.q, mode: "insensitive" as const } },
          { description: { contains: input.q, mode: "insensitive" as const } },
          { category: { contains: input.q, mode: "insensitive" as const } },
        ]
      : undefined,
    owner: input.verifiedOnly ? { verificationStatus: "VERIFIED" as const } : undefined,
    bookings:
      input.startDate && input.endDate
        ? {
            none: {
              status: { not: "CANCELLED" as const },
              startDate: { lt: new Date(input.endDate) },
              endDate: { gt: new Date(input.startDate) },
            },
          }
        : undefined,
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: { owner: true, reviews: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.item.count({ where }),
  ]);

  const response = {
    data: items.map((item) => serializeListingSummary(item, distanceForLocation(viewer?.location, item.location))),
    meta: getPaginationMeta(page, limit, total),
  };
  await setCache(cacheKey, response, 30);
  return response;
}

export async function getItemById(itemId: string, viewerId?: string) {
  const viewer = viewerId ? await prisma.user.findUnique({ where: { id: viewerId } }) : null;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      owner: true,
      reviews: {
        include: {
          author: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!item) throw new AppError("Listing not found.", 404);
  return {
    ...serializeListingSummary(item, distanceForLocation(viewer?.location, item.location)),
    owner: serializeUser(item.owner),
    reviews: item.reviews.map((review) => ({
      id: review.id,
      itemId: review.itemId,
      bookingId: review.bookingId,
      authorId: review.authorId,
      targetUserId: review.targetUserId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      author: {
        id: review.author.id,
        name: review.author.name,
        avatar: review.author.avatar ?? "",
      },
    })),
  };
}

export async function createItem(ownerId: string, input: {
  title: string;
  category: string;
  description: string;
  pricePerDay: number;
  location: string;
  images: string[];
  features: string[];
  insuranceEnabled: boolean;
  cancellationPolicy: string;
  isActive?: boolean;
}) {
  const item = await prisma.item.create({
    data: {
      ownerId,
      title: input.title,
      category: input.category,
      description: input.description,
      pricePerDay: input.pricePerDay,
      location: input.location,
      images: input.images,
      features: input.features,
      insuranceEnabled: input.insuranceEnabled,
      cancellationPolicy: input.cancellationPolicy,
      isActive: input.isActive ?? true,
    },
    include: { owner: true, reviews: true },
  });
  await invalidateCache("items:");
  return serializeListingSummary(item);
}

export async function updateItem(ownerId: string, itemId: string, input: {
  title: string;
  category: string;
  description: string;
  pricePerDay: number;
  location: string;
  images: string[];
  features: string[];
  insuranceEnabled: boolean;
  cancellationPolicy: string;
  isActive?: boolean;
}) {
  const item = await prisma.item.findFirst({
    where: { id: itemId, ownerId },
  });
  if (!item) throw new AppError("Listing not found.", 404);

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: input.title,
      category: input.category,
      description: input.description,
      pricePerDay: input.pricePerDay,
      location: input.location,
      images: input.images,
      features: input.features,
      insuranceEnabled: input.insuranceEnabled,
      cancellationPolicy: input.cancellationPolicy,
      isActive: input.isActive ?? item.isActive,
    },
    include: { owner: true, reviews: true },
  });
  await invalidateCache("items:");
  return serializeListingSummary(updated);
}

export async function deleteItem(ownerId: string, itemId: string) {
  const item = await prisma.item.findFirst({ where: { id: itemId, ownerId } });
  if (!item) throw new AppError("Listing not found.", 404);
  await prisma.item.delete({ where: { id: itemId } });
  await invalidateCache("items:");
}

export async function getCurrentUserItems(ownerId: string) {
  const items = await prisma.item.findMany({
    where: { ownerId },
    include: { owner: true, reviews: true },
    orderBy: { createdAt: "desc" },
  });
  return items.map((item) => serializeListingSummary(item));
}

export async function getItemAvailability(itemId: string, startDate?: string, endDate?: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new AppError("Listing not found.", 404);
  if (!startDate || !endDate) {
    return { available: true, conflicts: [] as string[] };
  }
  const conflicts = await prisma.booking.findMany({
    where: {
      itemId,
      status: { not: "CANCELLED" },
      startDate: { lt: new Date(endDate) },
      endDate: { gt: new Date(startDate) },
    },
    select: { id: true },
  });
  return {
    available: conflicts.length === 0,
    conflicts: conflicts.map((booking) => booking.id),
  };
}
