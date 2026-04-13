import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Calendar, CreditCard, MessageSquare, Star, Shield, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function HowItWorksPage() {
  const [, navigate] = useLocation();

  const steps = [
    {
      icon: Search,
      title: "Search & Discover",
      description: "Browse thousands of items available for rent in your area. From cameras to power tools, find exactly what you need.",
      color: "text-blue-500",
    },
    {
      icon: Calendar,
      title: "Choose Your Dates",
      description: "Select the dates you need the item for. Our real-time availability calendar shows you what's when.",
      color: "text-green-500",
    },
    {
      icon: CreditCard,
      title: "Book & Pay Securely",
      description: "Complete your booking with our secure payment system. Your money is held safely until the rental is complete.",
      color: "text-purple-500",
    },
    {
      icon: MessageSquare,
      title: "Connect & Collect",
      description: "Chat directly with the item owner to arrange pickup or delivery. Get all the details you need.",
      color: "text-orange-500",
    },
    {
      icon: Star,
      title: "Use & Review",
      description: "Enjoy your rental! Afterward, leave a review to help build trust in our community.",
      color: "text-yellow-500",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Insurance Protection",
      description: "Every rental is covered by our damage protection policy. Rent with peace of mind.",
    },
    {
      icon: Star,
      title: "Verified Users",
      description: "All users go through identity verification. Trust scores help you make informed decisions.",
    },
    {
      icon: MessageSquare,
      title: "24/7 Support",
      description: "Our support team is always ready to help with any questions or issues that arise.",
    },
  ];

  return (
    <AppLayout>
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">How RentConnect Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rent anything from people in your community in 5 simple steps. Safe, secure, and affordable.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <step.icon className={`w-8 h-8 ${step.color}`} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-semibold text-primary">Step {index + 1}</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                      <p className="text-muted-foreground text-lg">{step.description}</p>
                    </div>
                  </div>
                </div>
                <div className={index % 2 === 1 ? "md:order-1" : "flex justify-center"}>
                  <div className="text-9xl font-bold text-primary/5">{index + 1}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose RentConnect?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Preview */}
        <Card className="p-8 mb-12 bg-primary/5">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mb-6">
              Have questions? We've got answers. Check out our comprehensive FAQ section.
            </p>
            <Button variant="outline" onClick={() => navigate("/faq")}>
              View FAQs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already saving money and making money through peer-to-peer rentals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/search")}>
              Browse Items
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/listings/new")}>
              List Your Items
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default HowItWorksPage;
