import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Globe, Award, TrendingUp, Heart } from "lucide-react";

export function AboutPage() {
  return (
    <AppLayout>
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About RentConnect</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building trust in the sharing economy, one rental at a time
          </p>
        </div>

        {/* Mission */}
        <Card className="p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                RentConnect is a trust-enhanced peer-to-peer rental marketplace that enables people to 
                share underutilized belongings while building genuine community connections.
              </p>
              <p className="text-muted-foreground">
                We believe in creating a world where access matters more than ownership, and where 
                trust is built through transparency, verification, and shared experiences.
              </p>
            </div>
            <div className="flex justify-center">
              <Heart className="w-48 h-48 text-primary opacity-20" />
            </div>
          </div>
        </Card>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
            <p className="text-muted-foreground">
              Identity verification, trust scores, and secure payments protect every transaction.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community First</h3>
            <p className="text-muted-foreground">
              Real reviews, social connections, and local interactions build lasting relationships.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
            <p className="text-muted-foreground">
              Sharing resources reduces waste and environmental impact while saving money.
            </p>
          </Card>
        </div>

        {/* Stats */}
        <Card className="p-8 mb-12 bg-primary/5">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Award className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">10,000+</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">50,000+</p>
              <p className="text-sm text-muted-foreground">Successful Rentals</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">99.9%</p>
              <p className="text-sm text-muted-foreground">Safe Transactions</p>
            </div>
            <div className="text-center">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">4.9/5</p>
              <p className="text-sm text-muted-foreground">User Satisfaction</p>
            </div>
          </div>
        </Card>

        {/* Team */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join Us</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Whether you're looking to earn extra income from your belongings or need temporary 
            access to items, RentConnect makes it safe, easy, and affordable.
          </p>
          <Button size="lg" onClick={() => window.location.href = "/listings/new"}>
            Start Listing Today
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

export default AboutPage;
