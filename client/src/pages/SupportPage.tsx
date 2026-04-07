import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MessageCircle } from "lucide-react";

export function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <AppLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-4">Support</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Get in touch with our support team
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question or issue..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground mb-2">We typically respond within 24 hours</p>
                  <a href="mailto:info@rentconnect.dev" className="text-primary hover:underline">
                    info@rentconnect.dev
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-muted-foreground mb-2">Mon-Fri, 9am-6pm GMT</p>
                  <a href="tel:+441234567890" className="text-primary hover:underline">
                    +44 123 456 7890
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MessageCircle className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Live Chat</h3>
                  <p className="text-muted-foreground mb-2">Available during business hours</p>
                  <Button size="sm" variant="outline">
                    Start Chat
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5">
              <h3 className="font-semibold mb-2">Urgent Issues?</h3>
              <p className="text-muted-foreground mb-4">
                For urgent matters related to active bookings or disputes, please call our 
                priority support line.
              </p>
              <a href="tel:+441234567890" className="text-primary font-semibold hover:underline">
                Priority Line: +44 123 456 7890
              </a>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default SupportPage;
