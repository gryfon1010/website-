import { Router, raw } from "express";
import { requireAuth, type AuthenticatedRequest } from "@server/middleware/auth";
import { asyncHandler } from "@server/utils/async-handler";
import { confirmCheckoutSession, createStripeCheckoutSession, handleStripeWebhook } from "@server/services/payment.service";
import { prisma } from "@server/database/prisma";
import { AppError } from "@server/utils/app-error";

export const paymentsRouter = Router();
export const paymentsWebhookRouter = Router();

paymentsRouter.post(
  "/checkout",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const bookingId = String(req.body.bookingId ?? "");
    res.status(201).json(await createStripeCheckoutSession(bookingId, req.auth!.sub));
  }),
);

paymentsRouter.get(
  "/session/:id",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { stripeCheckoutSessionId: req.params.id },
          { id: req.params.id },
        ],
        booking: {
          OR: [{ renterId: req.auth!.sub }, { ownerId: req.auth!.sub }],
        },
      },
      include: { booking: true },
    });

    if (!payment) {
      throw new AppError("Payment session not found.", 404);
    }

    res.json({
      id: payment.id,
      bookingId: payment.bookingId,
      status: payment.status.toLowerCase(),
      amount: payment.amount,
      currency: payment.currency,
    });
  }),
);

paymentsRouter.post(
  "/session/:id/confirm",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await confirmCheckoutSession(req.params.id, req.auth!.sub));
  }),
);

paymentsWebhookRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    await handleStripeWebhook(req.headers["stripe-signature"], req.body as Buffer);
    res.json({ received: true });
  }),
);
