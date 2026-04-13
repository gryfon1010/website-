import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { HyggloHeader } from "./HyggloHeader";
import { HyggloFooter } from "./HyggloFooter";

interface HyggloLayoutProps {
  children: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  locationText?: string;
  dateText?: string;
}

export function HyggloLayout({
  children,
  showSearch = false,
  searchPlaceholder = "Search for what you want to rent",
}: HyggloLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HyggloHeader />

      <main className="flex-1">{children}</main>
      
      <HyggloFooter />
    </div>
  );
}
