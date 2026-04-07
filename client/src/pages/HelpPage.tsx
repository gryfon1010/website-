import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, Phone, Mail } from "lucide-react";

const helpTopics = [
  {
    icon: <HelpCircle className="w-8 h-8 text-primary" />,
    title: "Getting Started",
    description: "Learn the basics of using RentConnect",
    href: "/faq"
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-primary" />,
    title: "Renting Items",
    description: "How to find, book, and rent items",
    href: "/faq#renting"
  },
  {
    icon: <HelpCircle className="w-8 h-8 text-primary" />,
    title: "Listing Items",
    description: "Create and manage your listings",
    href: "/faq#listing"
  },
  {
    icon: <Phone className="w-8 h-8 text-primary" />,
    title: "Payments & Pricing",
    description: "Understanding payments and fees",
    href: "/faq#payments"
  },
  {
    icon: <HelpCircle className="w-8 h-8 text-primary" />,
    title: "Safety & Trust",
    description: "Stay safe and build trust",
    href: "/guarantee"
  },
  {
    icon: <Mail className="w-8 h-8 text-primary" />,
    title: "Disputes & Issues",
    description: "Resolve problems and disputes",
    href: "/disputes"
  }
];

export function HelpPage() {
  return (
    <AppLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Find answers to common questions and get support
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpTopics.map((topic, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="mb-4">{topic.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
              <p className="text-muted-foreground mb-4">{topic.description}</p>
              <a href={topic.href} className="text-primary hover:underline">
                Learn more →
              </a>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-primary/5">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to assist you with any questions or concerns
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.href = "/support"}>
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "mailto:info@rentconnect.dev"}>
              Email Us
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export default HelpPage;
