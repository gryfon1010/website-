import { Router } from 'express';
import { asyncHandler } from '@server/utils/async-handler';
import { validate } from '@server/middleware/validate';
import { z } from 'zod';
import { prisma } from '@server/database/prisma';
import { AppError } from '@server/utils/app-error';
import bcrypt from 'bcryptjs';
import type { AuthenticatedRequest } from '@server/middleware/auth';

export const adminRouter = Router();

// Require admin authentication middleware
interface AdminAuthenticatedRequest extends AuthenticatedRequest {
  admin?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

// Middleware to check if user is admin
function requireAdmin(req: AuthenticatedRequest, res: any, next: any) {
  // In production, verify admin token and check permissions
  // For now, we'll use a simplified approach
  next();
}

// Schemas
const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['moderator', 'admin', 'superadmin']),
  permissions: z.array(z.string()).optional(),
});

const suspendUserSchema = z.object({
  reason: z.string().min(10),
  duration: z.number().int().positive().optional(), // in hours, undefined = permanent
});

const resolveDisputeSchema = z.object({
  resolution: z.string().min(20),
  refundAmount: z.number().int().nonnegative().optional(),
  action: z.enum(['refund_full', 'refund_partial', 'no_refund', 'escalate']),
});

/**
 * GET /admin/stats - Platform statistics
 */
adminRouter.get(
  '/stats',
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      activeDisputes,
      totalRevenue,
      pendingPayouts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.item.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
      prisma.payout.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' },
      }),
    ]);

    res.json({
      totalUsers,
      totalListings,
      totalBookings,
      activeDisputes,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingPayouts: pendingPayouts._sum.amount || 0,
      platformFee: Math.round((totalRevenue._sum.amount || 0) * 0.08), // 8%
    });
  })
);

/**
 * GET /admin/users - List all users with filters
 */
adminRouter.get(
  '/users',
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const verified = req.query.verified === 'true';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (verified) {
      where.verificationStatus = 'VERIFIED';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          phoneVerified: true,
          role: true,
          verificationStatus: true,
          trustScore: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
          _count: {
            select: {
              items: true,
              renterBookings: true,
              ownerBookings: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * POST /admin/users/:id/suspend - Suspend a user
 */
adminRouter.post(
  '/users/:id/suspend',
  requireAdmin,
  validate({ body: suspendUserSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { reason, duration } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_SUSPENDED',
        entity: 'USER',
        entityId: id,
        metadata: {
          reason,
          duration,
          suspendedEmail: user.email,
        },
      },
    });

    // Update user status (using verification status as proxy for suspension)
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        verificationStatus: 'UNVERIFIED',
      },
      select: {
        id: true,
        email: true,
        name: true,
        verificationStatus: true,
      },
    });

    // Send suspension notification
    await prisma.notification.create({
      data: {
        userId: id,
        type: 'SYSTEM',
        title: 'Account Suspended',
        body: `Your account has been suspended. Reason: ${reason}`,
        href: '/support',
      },
    });

    res.json({
      success: true,
      user: updatedUser,
      message: `User ${user.email} has been suspended`,
    });
  })
);

/**
 * POST /admin/users/:id/verify - Verify a user manually
 */
adminRouter.post(
  '/users/:id/verify',
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        verificationStatus: 'VERIFIED',
      },
      select: {
        id: true,
        email: true,
        name: true,
        verificationStatus: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_VERIFIED',
        entity: 'USER',
        entityId: id,
        metadata: {
          verifiedEmail: user.email,
        },
      },
    });

    // Send verification notification
    await prisma.notification.create({
      data: {
        userId: id,
        type: 'SYSTEM',
        title: 'Account Verified',
        body: 'Congratulations! Your account has been verified by our team.',
        href: '/profile',
      },
    });

    res.json({
      success: true,
      user: updatedUser,
      message: `User ${user.email} has been verified`,
    });
  })
);

/**
 * GET /admin/listings - List all listings with moderation queue
 */
adminRouter.get(
  '/listings',
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string; // active, inactive, flagged

    const where: any = {};

    if (status === 'flagged') {
      // Listings with disputes or low ratings
      const flaggedItems = await prisma.item.findMany({
        where: {
          reviews: {
            some: {
              rating: { lte: 2 },
            },
          },
        },
        select: { id: true },
      });
      where.id = { in: flaggedItems.map(i => i.id) };
    }

    const [listings, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              trustScore: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              disputes: true,
            },
          },
        },
      }),
      prisma.item.count({ where }),
    ]);

    res.json({
      data: listings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * DELETE /admin/listings/:id - Remove listing (admin)
 */
adminRouter.delete(
  '/listings/:id',
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    const listing = await prisma.item.findUnique({ where: { id } });
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    await prisma.item.delete({ where: { id } });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'LISTING_DELETED',
        entity: 'ITEM',
        entityId: id,
        metadata: {
          listingTitle: listing.title,
          ownerId: listing.ownerId,
        },
      },
    });

    // Notify owner
    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        type: 'SYSTEM',
        title: 'Listing Removed',
        body: `Your listing "${listing.title}" has been removed by our moderation team.`,
        href: '/dashboard',
      },
    });

    res.json({
      success: true,
      message: 'Listing removed successfully',
    });
  })
);

/**
 * GET /admin/disputes - Get all disputes
 */
adminRouter.get(
  '/disputes',
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          item: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
          openedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.dispute.count({ where }),
    ]);

    res.json({
      data: disputes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * POST /admin/disputes/:id/resolve - Resolve a dispute
 */
adminRouter.post(
  '/disputes/:id/resolve',
  requireAdmin,
  validate({ body: resolveDisputeSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { resolution, refundAmount, action } = req.body;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        booking: true,
        renter: true,
        owner: true,
      },
    });

    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Update dispute
    await prisma.dispute.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution,
        updatedAt: new Date(),
      },
    });

    // Process refund if applicable
    if (action === 'refund_full' || action === 'refund_partial') {
      const refund = refundAmount || dispute.booking.totalPrice;
      
      // In production, call Stripe refund API
      // await processRefund(dispute.booking.id, refund, 'Dispute resolution');

      // Update payment
      await prisma.payment.updateMany({
        where: { bookingId: dispute.booking.id },
        data: {
          status: action === 'refund_full' ? 'CANCELLED' : 'PAID',
          refundedAt: action === 'refund_full' ? new Date() : null,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DISPUTE_RESOLVED',
        entity: 'DISPUTE',
        entityId: id,
        metadata: {
          resolution,
          action,
          refundAmount,
          disputeTitle: dispute.title,
        },
      },
    });

    // Notify both parties
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: dispute.renterId,
          type: 'DISPUTE',
          title: 'Dispute Resolved',
          body: `Your dispute "${dispute.title}" has been resolved.`,
          href: `/disputes/${id}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: dispute.ownerId,
          type: 'DISPUTE',
          title: 'Dispute Resolved',
          body: `Dispute "${dispute.title}" has been resolved by our team.`,
          href: `/disputes/${id}`,
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      resolution,
    });
  })
);

/**
 * GET /admin/analytics - Platform analytics
 */
adminRouter.get(
  '/analytics',
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const period = req.query.period || '30d'; // 7d, 30d, 90d
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      newUserCount,
      newListingCount,
      bookingCount,
      revenueData,
      disputeCount,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.item.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: {
          createdAt: { gte: startDate },
          status: 'PAID',
        },
      }),
      prisma.dispute.count({
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    // Get category breakdown
    const categoryBreakdown = await prisma.item.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    res.json({
      period,
      metrics: {
        newUsers: newUserCount,
        newListings: newListingCount,
        bookings: bookingCount,
        revenue: revenueData._sum.amount || 0,
        transactions: revenueData._count.id,
        disputes: disputeCount,
      },
      categoryBreakdown,
      platformFee: Math.round((revenueData._sum.amount || 0) * 0.08),
    });
  })
);

/**
 * GET /admin/audit-logs - View audit trail
 */
adminRouter.get(
  '/audit-logs',
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const action = req.query.action as string;
    const entity = req.query.entity as string;

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

export default adminRouter;
