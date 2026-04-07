import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { confirmCheckoutSession } from "@/services/payments";

export default function CheckoutSuccessPage() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId") ?? "";
  const bookingId = params.get("bookingId") ?? "";

  const confirmMutation = useMutation({
    mutationFn: confirmCheckoutSession,
  });

  useEffect(() => {
    if (sessionId) {
      confirmMutation.mutate(sessionId);
    }
  }, [confirmMutation, sessionId]);

  return (
    <AppLayout title="Checkout complete" subtitle="The backend is confirming your payment and booking state.">
      <Card className="max-w-xl mx-auto p-8 text-center space-y-4">
        <p className="text-lg">
          {confirmMutation.isPending ? "Finalising your booking..." : "Your booking is ready."}
        </p>
        <Button onClick={() => navigate(`/bookings/${bookingId}/confirmation`)}>View booking confirmation</Button>
      </Card>
    </AppLayout>
  );
}
