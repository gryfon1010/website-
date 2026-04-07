import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, PoundSterling } from "lucide-react";

export function GuaranteePage() {
  return (
    <AppLayout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">RentConnect Guarantee</h1>
          <p className="text-xl text-muted-foreground">
            Your peace of mind is our priority
          </p>
        </div>

        <Card className="p-8 mb-8 bg-primary/5">
          <div className="flex items-start gap-4 mb-6">
            <Shield className="w-12 h-12 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Our Promise to You</h2>
              <p className="text-muted-foreground">
                Every rental on RentConnect is protected by our comprehensive guarantee, 
                ensuring you can rent with confidence.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <CheckCircle className="w-8 h-8 text-success mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-muted-foreground">
              All payments are held securely in escrow and only released to owners after 
              successful completion of the rental period.
            </p>
          </Card>

          <Card className="p-6">
            <CheckCircle className="w-8 h-8 text-success mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verified Users</h3>
            <p className="text-muted-foreground">
              Identity verification, phone verification, and trust scores help ensure 
              you're dealing with real, accountable people.
            </p>
          </Card>

          <Card className="p-6">
            <CheckCircle className="w-8 h-8 text-success mb-4" />
            <h3 className="text-xl font-semibold mb-2">Damage Protection</h3>
            <p className="text-muted-foreground">
              Comprehensive coverage protects both renters and owners against accidental 
              damage during the rental period.
            </p>
          </Card>

          <Card className="p-6">
            <CheckCircle className="w-8 h-8 text-success mb-4" />
            <h3 className="text-xl font-semibold mb-2">Dispute Resolution</h3>
            <p className="text-muted-foreground">
              Our dedicated team is here to mediate and resolve any issues quickly and fairly.
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Book with Confidence</h3>
                <p className="text-muted-foreground">
                  Browse verified listings, read reviews, and check trust scores before booking.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Payment</h3>
                <p className="text-muted-foreground">
                  Your payment is held safely in escrow until the rental is successfully completed.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Protected Rental</h3>
                <p className="text-muted-foreground">
                  Both parties are covered by our guarantee throughout the entire rental period.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Support Available</h3>
                <p className="text-muted-foreground">
                  Our team is available to help resolve any issues that may arise.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8">
          <Button size="lg" onClick={() => window.location.href = "/search"}>
            Browse Listings
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

export default GuaranteePage;
