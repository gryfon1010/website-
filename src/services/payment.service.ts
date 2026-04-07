import Stripe from "stripe";
import { env } from "@server/config/env";
import { prisma } from "@server/database/prisma";
import { AppError } from "@server/utils/app-error";
import { createNotification } from "@server/services/notification.service";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export async function createStripeCheckoutSession(bookingId: string, renterId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      item: true,
    },
  });

  if (!booking || booking.renterId !== renterId) {
    throw new AppError("Booking not found.", 404);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: undefined,
    success_url: `${env.CLIENT_URL}/checkout/success?sessionId={CHECKOUT_SESSION_ID}&bookingId=${booking.id}`,
    cancel_url: `${env.CLIENT_URL}/items/${booking.itemId}`,
    metadata: {
      bookingId: booking.id,
      itemId: booking.itemId,
      renterId: booking.renterId,
      ownerId: booking.ownerId,
    },
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: booking.item.title,
            description: `${booking.dayCount} days rental`,
          },
          unit_amount: booking.totalPrice * 100,
        },
        quantity: 1,
      },
    ],
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      provider: "STRIPE",
      stripeCheckoutSessionId: session.id,
      amount: booking.totalPrice,
      currency: "gbp",
      status: "PENDING",
    },
    update: {
      stripeCheckoutSessionId: session.id,
      amount: booking.totalPrice,
      currency: "gbp",
      status: "PENDING",
    },
  });

  return {
    provider: "stripe" as const,
    bookingId: booking.id,
    sessionId: session.id,
    checkoutUrl: session.url ?? "",
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  };
}

export async function handleStripeWebhook(signature: string | string[] | undefined, payload: Buffer) {
  if (!signature || Array.isArray(signature)) {
    throw new AppError("Missing Stripe signature.", 400);
  }

  const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return event;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentReleaseAt: new Date(Date.now() + env.PAYMENT_RELEASE_DELAY_HOURS * 60 * 60 * 1000),
      },
    });

    await prisma.payment.updateMany({
      where: { bookingId },
      data: {
        status: "PAID",
        stripeCheckoutSessionId: session.id,
      },
    });

    await createNotification({
      userId: booking.ownerId,
      type: "PAYMENT",
      title: "Booking paid",
      body: "A renter completed payment and the booking is confirmed.",
      href: `/bookings/${booking.id}/confirmation`,
    });
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: charge.payment_intent as string | undefined },
      data: { status: "CANCELLED", refundedAt: new Date() },
    });
  }

  return event;
}

export async function confirmCheckoutSession(sessionId: string, userId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    throw new AppError("Checkout session is missing booking metadata.", 400);
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      renterId: userId,
    },
  });
  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  if (session.payment_status === "paid") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentReleaseAt: new Date(Date.now() + env.PAYMENT_RELEASE_DELAY_HOURS * 60 * 60 * 1000),
      },
    });

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        provider: "STRIPE",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        amount: booking.totalPrice,
        currency: "gbp",
        status: "PAID",
      },
      update: {
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        amount: booking.totalPrice,
        status: "PAID",
      },
    });
  }

  return {
    success: true,
    bookingId: booking.id,
    paymentStatus: session.payment_status,
  };
}
