import { prisma } from '@server/database/prisma';
import { logger } from '@server/utils/logger';

interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  category?: string;
  location?: string;
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newListings: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  disputeRate: number;
  trustScoreAverage: number;
}

/**
 * Get comprehensive platform analytics
 */
export async function getPlatformAnalytics(filters: AnalyticsFilters): Promise<DashboardMetrics> {
  const { startDate, endDate } = filters;

  const where: any = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [
    totalUsers,
    activeUsers,
    newListings,
    totalBookings,
    completedBookings,
    revenueData,
    disputeCount,
    trustScoreData,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // Active users (logged in last 7 days - would need lastLoginAt field)
    prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // New listings
    prisma.item.count({
      where: startDate ? { createdAt: { gte: startDate } } : {},
    }),

    // Total bookings
    prisma.booking.count({ where }),

    // Completed bookings
    prisma.booking.count({
      where: {
        ...where,
        status: 'COMPLETED',
      },
    }),

    // Revenue
    prisma.payment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        ...where,
        status: 'PAID',
      },
    }),

    // Disputes
    prisma.dispute.count({
      where: startDate ? { createdAt: { gte: startDate } } : {},
    }),

    // Average trust score
    prisma.user.aggregate({
      _avg: { trustScore: true },
    }),
  ]);

  const bookingValue = revenueData._sum.amount || 0;
  const transactionCount = revenueData._count.id || 1;

  return {
    totalUsers,
    activeUsers,
    newListings,
    totalBookings,
    completedBookings,
    totalRevenue: bookingValue,
    averageBookingValue: Math.round(bookingValue / transactionCount),
    disputeRate: Math.round((disputeCount / totalBookings) * 100 * 100) / 100, // percentage
    trustScoreAverage: Math.round(trustScoreData._avg.trustScore || 0),
  };
}

/**
 * Get user growth analytics
 */
export async function getUserGrowthAnalytics(days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Group users by signup date
  const userGrowth = await prisma.$queryRaw`
    SELECT 
      DATE("createdAt") as date,
      COUNT(*) as count,
      role
    FROM "User"
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE("createdAt"), role
    ORDER BY date ASC
  `;

  // Calculate growth rate
  const currentUserCount = await prisma.user.count();
  const previousUserCount = await prisma.user.count({
    where: {
      createdAt: { lt: startDate },
    },
  });

  const growthRate = previousUserCount > 0
    ? ((currentUserCount - previousUserCount) / previousUserCount) * 100
    : 0;

  return {
    dailySignups: userGrowth,
    growthRate: Math.round(growthRate * 100) / 100,
    currentUserCount,
    newUsersInPeriod: currentUserCount - previousUserCount,
  };
}

/**
 * Get listing performance analytics
 */
export async function getListingPerformanceAnalytics(filters: AnalyticsFilters) {
  const { startDate, endDate, category, location } = filters;

  const where: any = { isActive: true };
  if (category) where.category = category;
  if (location) where.location = { contains: location, mode: 'insensitive' };

  const listings = await prisma.item.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      pricePerDay: true,
      location: true,
      owner: {
        select: {
          id: true,
          name: true,
          trustScore: true,
        },
      },
      bookings: {
        where: startDate ? { createdAt: { gte: startDate } } : {},
        select: {
          totalPrice: true,
          status: true,
          dayCount: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  // Calculate performance metrics for each listing
  const performance = listings.map((listing: any) => {
    const totalBookings = listing.bookings.length;
    const completedBookings = listing.bookings.filter((b: any) => b.status === 'COMPLETED').length;
    const totalRevenue = listing.bookings
      .filter((b: any) => b.status === 'COMPLETED')
      .reduce((sum: number, b: any) => sum + b.totalPrice, 0);
    
    const avgRating = listing.reviews.length > 0
      ? listing.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / listing.reviews.length
      : 0;

    const occupancyRate = listing.bookings.length > 0
      ? (completedBookings / listing.bookings.length) * 100
      : 0;

    return {
      id: listing.id,
      title: listing.title,
      category: listing.category,
      pricePerDay: listing.pricePerDay,
      location: listing.location,
      owner: listing.owner,
      metrics: {
        totalBookings,
        completedBookings,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: listing.reviews.length,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        avgDailyRevenue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
      },
    };
  });

  // Sort by revenue
  performance.sort((a: any, b: any) => b.metrics.totalRevenue - a.metrics.totalRevenue);

  return {
    listings: performance,
    summary: {
      totalListings: performance.length,
      avgOccupancyRate: Math.round(
        performance.reduce((sum: number, l: any) => sum + l.metrics.occupancyRate, 0) / performance.length * 100
      ) / 100,
      topPerformer: performance[0]?.title || null,
    },
  };
}

/**
 * Get revenue breakdown by time period
 */
export async function getRevenueAnalytics(period: 'day' | 'week' | 'month' | 'year') {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
  }

  // Daily revenue breakdown
  const dailyRevenue = await prisma.$queryRaw`
    SELECT 
      DATE("createdAt") as date,
      SUM(amount) as revenue,
      COUNT(*) as transactions
    FROM "Payment"
    WHERE "createdAt" >= ${startDate}
    AND status = 'PAID'
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  // Revenue by category
  const categoryRevenue = await prisma.$queryRaw`
    SELECT 
      i.category,
      SUM(p.amount) as revenue,
      COUNT(DISTINCT b.id) as bookings
    FROM "Payment" p
    JOIN "Booking" b ON p."bookingId" = b.id
    JOIN "Item" i ON b."itemId" = i.id
    WHERE p.status = 'PAID'
    AND p."createdAt" >= ${startDate}
    GROUP BY i.category
    ORDER BY revenue DESC
  `;

  // Platform fees earned
  const totalRevenue = dailyRevenue.reduce((sum: number, row: any) => sum + parseFloat(row.revenue), 0);
  const platformFees = Math.round(totalRevenue * 0.08); // 8% commission

  return {
    period,
    dailyBreakdown: dailyRevenue.map((row: any) => ({
      date: row.date,
      revenue: parseFloat(row.revenue),
      transactions: parseInt(row.transactions),
    })),
    categoryBreakdown: categoryRevenue.map((row: any) => ({
      category: row.category,
      revenue: parseFloat(row.revenue),
      bookings: parseInt(row.bookings),
    })),
    totalRevenue: Math.round(totalRevenue),
    platformFees,
    netToOwners: Math.round(totalRevenue * 0.92),
  };
}

/**
 * Get booking funnel analytics
 */
export async function getBookingFunnelAnalytics(days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      status: true,
      paymentStatus: true,
    },
  });

  const funnel = {
    total: bookings.length,
    pending: bookings.filter((b: any) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
    active: bookings.filter((b: any) => b.status === 'ACTIVE').length,
    completed: bookings.filter((b: any) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b: any) => b.status === 'CANCELLED').length,
    paid: bookings.filter((b: any) => b.paymentStatus === 'PAID').length,
  };

  // Calculate conversion rates
  const conversionRates = {
    pendingToConfirmed: funnel.pending > 0
      ? Math.round((funnel.confirmed / funnel.pending) * 100 * 100) / 100
      : 0,
    confirmedToCompleted: funnel.confirmed > 0
      ? Math.round((funnel.completed / funnel.confirmed) * 100 * 100) / 100
      : 0,
    overallCompletion: funnel.total > 0
      ? Math.round((funnel.completed / funnel.total) * 100 * 100) / 100
      : 0,
    cancellationRate: funnel.total > 0
      ? Math.round((funnel.cancelled / funnel.total) * 100 * 100) / 100
      : 0,
  };

  return {
    funnel,
    conversionRates,
    period: `${days} days`,
  };
}

/**
 * Get trust score distribution
 */
export async function getTrustScoreDistribution() {
  const users = await prisma.user.findMany({
    select: {
      trustScore: true,
      verificationStatus: true,
    },
  });

  const distribution = {
    excellent: users.filter((u: any) => u.trustScore >= 80).length,
    good: users.filter((u: any) => u.trustScore >= 60 && u.trustScore < 80).length,
    average: users.filter((u: any) => u.trustScore >= 40 && u.trustScore < 60).length,
    low: users.filter((u: any) => u.trustScore < 40).length,
  };

  const byVerificationStatus = await prisma.user.groupBy({
    by: ['verificationStatus'],
    _avg: {
      trustScore: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    distribution,
    byVerificationStatus: byVerificationStatus.map((status: any) => ({
      status: status.verificationStatus,
      avgTrustScore: Math.round(status._avg.trustScore || 0),
      count: status._count.id,
    })),
    platformAverage: Math.round(
      users.reduce((sum: number, u: any) => sum + u.trustScore, 0) / users.length * 100
    ) / 100,
  };
}

/**
 * Generate executive summary report
 */
export async function generateExecutiveSummary(period: 'week' | 'month' | 'quarter') {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    platformMetrics,
    userGrowth,
    revenueData,
    bookingFunnel,
    trustDistribution,
  ] = await Promise.all([
    getPlatformAnalytics({ startDate }),
    getUserGrowthAnalytics(days),
    getRevenueAnalytics('month'),
    getBookingFunnelAnalytics(days),
    getTrustScoreDistribution(),
  ]);

  // Calculate key insights
  const insights = [];

  if (userGrowth.growthRate > 10) {
    insights.push(`Strong user growth: ${userGrowth.growthRate}% increase this period`);
  }

  if (bookingFunnel.conversionRates.cancellationRate > 20) {
    insights.push('High cancellation rate detected - consider reviewing policies');
  }

  if (platformMetrics.disputeRate > 5) {
    insights.push('Elevated dispute rate - recommend enhanced verification');
  }

  const healthScore = calculateHealthScore(platformMetrics, bookingFunnel, trustDistribution);

  return {
    period,
    generatedAt: new Date().toISOString(),
    healthScore,
    keyMetrics: {
      users: platformMetrics.totalUsers,
      revenue: platformMetrics.totalRevenue,
      bookings: platformMetrics.totalBookings,
      growth: userGrowth.growthRate,
    },
    insights,
    recommendations: generateRecommendations(platformMetrics, bookingFunnel, trustDistribution),
  };
}

/**
 * Calculate overall platform health score (0-100)
 */
function calculateHealthScore(
  metrics: DashboardMetrics,
  funnel: any,
  trustDist: any
): number {
  let score = 100;

  // Booking completion rate (max -20)
  const completionRate = funnel.conversionRates.overallCompletion;
  if (completionRate < 50) score -= 20;
  else if (completionRate < 70) score -= 10;

  // Dispute rate (max -20)
  if (metrics.disputeRate > 10) score -= 20;
  else if (metrics.disputeRate > 5) score -= 10;

  // Trust score distribution (max -20)
  const lowTrustPercent = (trustDist.distribution.low / (metrics.totalUsers || 1)) * 100;
  if (lowTrustPercent > 30) score -= 20;
  else if (lowTrustPercent > 15) score -= 10;

  // Cancellation rate (max -20)
  const cancellationRate = funnel.conversionRates.cancellationRate;
  if (cancellationRate > 30) score -= 20;
  else if (cancellationRate > 15) score -= 10;

  // Revenue consistency (max -20)
  if (metrics.totalRevenue === 0) score -= 20;
  else if (metrics.averageBookingValue < 50) score -= 10;

  return Math.max(0, score);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  metrics: DashboardMetrics,
  funnel: any,
  trustDist: any
): string[] {
  const recommendations: string[] = [];

  if (funnel.conversionRates.cancellationRate > 15) {
    recommendations.push('Review cancellation policies to reduce cancellations');
  }

  if (trustDist.distribution.low > metrics.totalUsers * 0.2) {
    recommendations.push('Implement trust-building initiatives for low-score users');
  }

  if (metrics.disputeRate > 5) {
    recommendations.push('Enhance verification requirements to reduce disputes');
  }

  if (funnel.conversionRates.pendingToConfirmed < 60) {
    recommendations.push('Improve booking confirmation flow');
  }

  if (recommendations.length === 0) {
    recommendations.push('Platform is performing well - focus on scaling');
  }

  return recommendations;
}
