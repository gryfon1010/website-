import { loadStripe } from "@stripe/stripe-js";
import type { CheckoutSession } from "@shared/contracts";
import { api } from "./http";

export async function createCheckoutSession(bookingId: string) {
  const response = await api.post<CheckoutSession>("/payments/checkout", { bookingId });
  return response.data;
}

export async function confirmCheckoutSession(sessionId: string) {
  const response = await api.post<{ success: boolean }>(`/payments/session/${sessionId}/confirm`);
  return response.data;
}

export async function redirectToCheckout(session: CheckoutSession) {
  if (session.provider === "stripe" && session.publishableKey) {
    const stripe = await loadStripe(session.publishableKey);
    if (stripe) {
      await (stripe as unknown as { redirectToCheckout: (options: { sessionId: string }) => Promise<unknown> }).redirectToCheckout({
        sessionId: session.sessionId,
      });
      return;
    }
  }

  window.location.assign(session.checkoutUrl);
}
