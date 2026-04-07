import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <AppLayout title="Page not found" subtitle="The route does not exist in the current application.">
      <div className="py-20 text-center">
        <Button onClick={() => navigate("/")}>Go home</Button>
      </div>
    </AppLayout>
  );
}
