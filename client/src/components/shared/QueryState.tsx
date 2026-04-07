import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function QueryState({
  isLoading,
  isError,
  error,
  onRetry,
  children,
  skeletonClassName = "h-40 w-full",
}: {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  children: React.ReactNode;
  skeletonClassName?: string;
}) {
  if (isLoading) {
    return <Skeleton className={skeletonClassName} />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
        <p className="font-medium">Something went wrong</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Retry
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
