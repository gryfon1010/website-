import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/features/auth/AuthContext";
import { SocketProvider } from "@/features/chat/SocketProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SocketProvider>
              {children}
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </SocketProvider>
          </AuthProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
