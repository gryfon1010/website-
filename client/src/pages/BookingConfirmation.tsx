import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { QueryState } from "@/components/shared/QueryState";
import { Card } from "@/components/ui/card";
import { getBooking } from "@/services/rentals";
import { formatCurrency, formatDate } from "@/lib/format";

export default function BookingConfirmation() {
  const [, params] = useRoute("/bookings/:id/confirmation");
  const bookingQuery = useQuery({
    queryKey: ["bookings", "detail", params?.id],
    queryFn: () => getBooking(params!.id),
    enabled: Boolean(params?.id),
  });

  return (
    <AppLayout title="Booking confirmed" subtitle="This page is powered by live booking data from the backend.">
      <QueryState
        isLoading={bookingQuery.isLoading}
        isError={bookingQuery.isError}
        error={bookingQuery.error}
        onRetry={() => bookingQuery.refetch()}
        skeletonClassName="h-72 w-full"
      >
        {bookingQuery.data && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <img src={bookingQuery.data.item.images[0]} alt={bookingQuery.data.item.title} className="w-28 h-28 rounded-2xl object-cover" />
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{bookingQuery.data.item.title}</h2>
                  <p className="text-muted-foreground">{bookingQuery.data.owner.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(bookingQuery.data.startDate)} to {formatDate(bookingQuery.data.endDate)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex justify-between"><span>Status</span><span>{bookingQuery.data.status}</span></div>
              <div className="flex justify-between"><span>Payment</span><span>{bookingQuery.data.paymentStatus}</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(bookingQuery.data.subtotal)}</span></div>
              <div className="flex justify-between"><span>Service fee</span><span>{formatCurrency(bookingQuery.data.serviceFee)}</span></div>
              <div className="flex justify-between"><span>Damage waiver</span><span>{formatCurrency(bookingQuery.data.damageWaiver)}</span></div>
              <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(bookingQuery.data.totalPrice)}</span>
              </div>
            </Card>
          </div>
        )}
      </QueryState>
    </AppLayout>
  );
}
