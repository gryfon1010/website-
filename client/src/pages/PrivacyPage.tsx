import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";

export function PrivacyPage() {
  return (
    <AppLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <Card className="p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, including your name, email address, 
              phone number, profile information, and payment details when you create an account or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Facilitate rental transactions</li>
              <li>Verify your identity</li>
              <li>Process payments</li>
              <li>Send transactional communications</li>
              <li>Improve our services</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We share your information with other users as necessary to facilitate rentals (e.g., name, 
              contact information, reviews). We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal information. You can do this 
              through your account settings or by contacting us at info@rentconnect.dev.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience, analyze site 
              usage, and personalize content. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Our platform uses third-party services such as Stripe for payments and Resend for emails. 
              These services have their own privacy policies governing your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about this Privacy Policy, please contact us at info@rentconnect.dev
            </p>
          </section>
        </Card>

        <p className="text-sm text-muted-foreground mt-8">
          Last updated: March 30, 2026
        </p>
      </div>
    </AppLayout>
  );
}

export default PrivacyPage;
