import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does RentConnect work?",
    answer: "RentConnect is a peer-to-peer rental marketplace where you can list items you own to earn money, or rent items from others when you need them. Simply create an account, verify your identity, and start browsing or listing!"
  },
  {
    question: "Is my payment secure?",
    answer: "Absolutely! All payments are processed through Stripe and held securely in escrow. The payment is only released to the owner after the rental period is successfully completed."
  },
  {
    question: "What if an item gets damaged?",
    answer: "RentConnect provides damage protection for all rentals. Both renters and owners are protected. In case of damage, you can raise a dispute and our team will help resolve it fairly."
  },
  {
    question: "How do I verify my identity?",
    answer: "You can verify your identity through your profile page. We offer email verification, phone verification, and government ID verification. Verified users get higher trust scores and better visibility."
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, but cancellation policies vary by listing. Owners can choose from Flexible, Medium, or Strict cancellation policies. Check the listing details before booking."
  },
  {
    question: "How do I become a verified user?",
    answer: "Complete your profile, verify your email and phone number, and optionally upload a government ID. Verified users receive a badge and higher trust scores."
  },
  {
    question: "What categories can I list?",
    answer: "You can list items in Electronics, Tools & Garden, Sports & Outdoors, Party & Events, Home & Living, Fashion & Accessories, Toys & Games, and more!"
  },
  {
    question: "How does pricing work?",
    answer: "Owners set their own daily, weekly, and monthly rates. Our smart pricing system can suggest optimal prices based on demand and similar items in your area."
  },
  {
    question: "What happens if there's a problem?",
    answer: "Our dispute resolution team is here to help. You can raise a dispute through the platform, provide evidence, and our team will mediate a fair resolution."
  },
  {
    question: "Is RentConnect available in my area?",
    answer: "RentConnect is available across the UK, with high activity in London, Manchester, Birmingham, and other major cities. Check the search page to see what's available near you!"
  }
];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <AppLayout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about RentConnect
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <div className="divide-y">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-start gap-4 text-left"
                >
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <p className="mt-4 text-muted-foreground">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a href="/support" className="text-primary hover:underline">
            Contact our support team
          </a>
        </div>
      </div>
    </AppLayout>
  );
}

export default FAQPage;
