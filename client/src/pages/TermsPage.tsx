import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";

export function TermsPage() {
  return (
    <AppLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        
        <Card className="p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using RentConnect, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use this platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
            <p className="text-muted-foreground">
              Permission is granted to temporarily access the materials on RentConnect for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. User Responsibilities</h2>
            <p className="text-muted-foreground">
              As a user of RentConnect, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Use the platform in compliance with all applicable laws</li>
              <li>Respect the rights of other users</li>
              <li>List only items you legally own or have the right to rent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Rental Agreements</h2>
            <p className="text-muted-foreground">
              RentConnect facilitates peer-to-peer rentals but is not a party to rental agreements between users. 
              Users are responsible for understanding and fulfilling their obligations under any rental agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Payments and Fees</h2>
            <p className="text-muted-foreground">
              RentConnect charges a service fee for each transaction. All payments are processed through 
              secure third-party payment processors. Refunds are subject to the owner's cancellation policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Any disputes arising from rentals should first be addressed between the parties. If unresolved, 
              users may utilize RentConnect's dispute resolution process. Our decisions are final.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              RentConnect shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of the platform or any rental transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Modifications</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the platform after 
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms and Conditions, please contact us at info@rentconnect.dev
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

export default TermsPage;
