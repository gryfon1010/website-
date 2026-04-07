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
  locationText = "Near London (change)",
  dateText = "Select dates",
}: HyggloLayoutProps) {
  const [, navigate] = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [location, setLocation] = useState("London");
  const [dates, setDates] = useState<{start: string; end: string} | null>(null);

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    // Build search URL with query parameters
    const params = new URLSearchParams();
    params.set('q', searchValue);
    if (location) params.set('location', location);
    if (dates?.start) params.set('start', dates.start);
    if (dates?.end) params.set('end', dates.end);
    
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLocationClick = () => {
    const newLocation = prompt('Enter your location (city or postcode):', location);
    if (newLocation && newLocation.trim()) {
      setLocation(newLocation.trim());
      toast.success(`Location updated to ${newLocation.trim()}`);
    }
  };

  const handleDateClick = () => {
    const startDate = prompt('Enter start date (YYYY-MM-DD):');
    if (startDate) {
      const endDate = prompt('Enter end date (YYYY-MM-DD):');
      if (endDate) {
        setDates({ start: startDate, end: endDate });
        toast.success(`Dates selected: ${startDate} to ${endDate}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HyggloHeader />
      
      {showSearch && (
        <div className="bg-white border-b border-border py-4">
          <div className="container">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <button onClick={handleSearch} className="btn-cta h-12 px-8 rounded-full">
                Search
              </button>
              <div className="hidden md:flex items-center gap-4 text-sm">
                <button onClick={handleLocationClick} className="flex items-center gap-1 text-foreground hover:text-primary transition-smooth cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Near {location} (change)
                </button>
                <button onClick={handleDateClick} className="flex items-center gap-1 text-foreground hover:text-primary transition-smooth cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {dates?.start && dates?.end 
                    ? `${dates.start} to ${dates.end}`
                    : dateText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>
      
      <HyggloFooter />
    </div>
  );
}
