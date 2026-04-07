import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location)}`);
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
