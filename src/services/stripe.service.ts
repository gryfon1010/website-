import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
});

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent({
  amount,
  currency,
  customerId,
  metadata,
}: CreatePaymentIntentParams) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
}

export async function confirmPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error: any) {
    throw new Error(`Failed to confirm payment: ${error.message}`);
  }
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // If not provided, full refund
      reason: 'requested_by_customer',
    });

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
    };
  } catch (error: any) {
    throw new Error(`Failed to process refund: ${error.message}`);
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
    });

    return {
      customerId: customer.id,
    };
  } catch (error: any) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
}

export async function createPayout(
  destination: string,
  amount: number,
  metadata?: Record<string, string>
) {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'gbp',
      destination,
      metadata: metadata || {},
    });

    return {
      transferId: transfer.id,
      status: (transfer as any).status,
      amount: transfer.amount,
    };
  } catch (error: any) {
    throw new Error(`Failed to create payout: ${error.message}`);
  }
}

export async function handleWebhook(
  body: string,
  signature: string,
  webhookSecret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error: any) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}
