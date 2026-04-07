import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, TrendingUp, Shield, Users } from "lucide-react";

export function PartnershipsPage() {
  return (
    <AppLayout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Partnerships</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build strategic partnerships with RentConnect and expand your reach
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <Handshake className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Business Partnerships</h3>
            <p className="text-muted-foreground">
              Partner with us to offer rental services to your customers or integrate 
              RentConnect into your existing platform.
            </p>
          </Card>

          <Card className="p-6">
            <TrendingUp className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Affiliate Program</h3>
            <p className="text-muted-foreground">
              Earn commissions by referring new users and listings to the RentConnect community.
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Insurance Partners</h3>
            <p className="text-muted-foreground">
              Collaborate with us to provide enhanced protection and insurance options for rentals.
            </p>
          </Card>

          <Card className="p-6">
            <Users className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community Organizations</h3>
            <p className="text-muted-foreground">
              Work with local communities, universities, and organizations to promote sharing economy.
            </p>
          </Card>
        </div>

        <Card className="p-8 mb-8 bg-primary/5">
          <h2 className="text-2xl font-bold mb-4">Why Partner with RentConnect?</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              Access to growing peer-to-peer rental market
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              Trusted platform with verified users
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              Seamless integration and support
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              Shared values of sustainability and community
            </li>
          </ul>
        </Card>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Interested in Partnering?</h2>
          <p className="text-muted-foreground mb-6">
            Get in touch to explore partnership opportunities
          </p>
          <Button size="lg" onClick={() => window.location.href = "mailto:partnerships@rentconnect.dev"}>
            Contact Partnership Team
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

export default PartnershipsPage;
