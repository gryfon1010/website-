import { useState } from "react";
import { Search, Menu, X, MapPin, Calendar as CalendarIcon, Globe, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const POPULAR_LOCATIONS = ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool"];

export function HyggloHeader() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<{ from?: Date; to?: Date } | undefined>();
  
  // Location States
  const [location, setLocation] = useState("London");
  const [locationSearch, setLocationSearch] = useState("");

  const handleSearch = () => {
    // We could pass date params here in the future
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/search`);
    }
  };

  const formatDateLabel = () => {
    if (date?.from) {
      if (date.to) {
        return `${date.from.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})} - ${date.to.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}`;
      }
      return date.from.toLocaleDateString(undefined, { month: 'short', day: 'numeric'});
    }
    return "Select dates";
  };

  const filteredLocations = POPULAR_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-500 py-4">
      <div className="container relative flex flex-col gap-4">
        
        {/* TOP ROW: Small links */}
        <div className="hidden md:flex justify-end items-center gap-6 text-xs text-gray-600 font-medium">
          <button onClick={() => navigate("/areas")} className="flex items-center gap-1.5 hover:text-[var(--logo-color)] transition-colors duration-200">
            <Globe className="w-4 h-4" /> GB
          </button>
          <button onClick={() => navigate("/about")} className="hover:text-[var(--cta-green)] transition-all duration-200 hover:-translate-y-0.5">How RentConnect works</button>
          <button onClick={() => navigate("/guarantee")} className="hover:text-[var(--cta-green)] transition-all duration-200 hover:-translate-y-0.5">Guarantee</button>
          <button onClick={() => navigate("/faq")} className="hover:text-[var(--cta-green)] transition-all duration-200 hover:-translate-y-0.5">FAQ's</button>
          <button onClick={() => navigate("/contact")} className="hover:text-[var(--cta-green)] transition-all duration-200 hover:-translate-y-0.5">Contact</button>
        </div>

        {/* MIDDLE ROW: Logo, Search, CTA */}
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex-shrink-0 group">
            <span className="text-4xl font-bold tracking-tight transition-transform duration-300 group-hover:scale-105 inline-block" style={{ color: "var(--logo-color)", fontFamily: "var(--font-display)" }}>
              RentConnect
            </span>
          </button>

          {/* Search Bar (Pill) */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center bg-white border border-gray-100 rounded-full px-4 py-1.5 shadow-md hover:shadow-lg focus-within:shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-[var(--cta-green)] focus-within:ring-opacity-50">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search for what you want to rent"
              className="flex-1 bg-transparent border-none outline-none text-base text-gray-700 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button 
              className="rounded-full px-6 text-white font-medium ml-2 hover:scale-105 hover:shadow-md transition-all duration-300"
              style={{ backgroundColor: "var(--cta-green)" }}
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Button 
              className="rounded-full px-6 text-white font-medium hidden md:flex hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" 
              style={{ backgroundColor: "var(--cta-green)" }}
              onClick={() => navigate("/listings/new")}
            >
              Create listing
            </Button>
            
            {isAuthenticated ? (
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-10 h-10 rounded-full border border-gray-200 shadow-sm flex items-center justify-center font-bold text-sm bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-300 text-gray-700">
                      {user?.name?.charAt(0) || "U"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">My profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/bookings")} className="cursor-pointer">Bookings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50">Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <button className="w-10 h-10 rounded-full border border-gray-200 shadow-sm flex items-center justify-center font-bold text-sm bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-300" onClick={() => navigate("/login")}>
                  <User className="w-5 h-5 text-gray-600" />
                </button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: Filters */}
        <div className="hidden md:flex justify-center items-center gap-8 text-sm font-medium pb-2 text-gray-600">
          
          {/* Location Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:text-[var(--logo-color)] transition-colors duration-200">
                <MapPin className="w-4 h-4" /> Near <span className="font-bold text-gray-900 border-b border-transparent hover:border-gray-900 transition-colors">{location}</span> <span style={{ color: "var(--cta-green)" }}>(change)</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 rounded-2xl border-gray-200 shadow-xl" align="center">
              <h4 className="font-semibold text-sm mb-2 text-gray-900">Where are you looking?</h4>
              <div className="flex bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[var(--cta-green)] transition-all mb-3">
                <Search className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <input
                  type="text"
                  placeholder="Search city or area..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocation(loc); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); }}
                      className="text-left px-3 py-2 rounded-md hover:bg-[var(--cta-green)] hover:text-white transition-colors text-sm font-medium"
                    >
                      {loc}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Search for "{locationSearch}" everywhere.
                    <button 
                      onClick={() => { setLocation(locationSearch); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); }} 
                      className="block mt-2 text-[var(--cta-green)] hover:underline font-bold"
                    >
                      Use "{locationSearch}"
                    </button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Calendar Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200" style={{ color: "var(--cta-green)" }}>
                <CalendarIcon className="w-4 h-4" /> {formatDateLabel()}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-gray-200 shadow-xl" align="center">
              <Calendar
                mode="range"
                selected={date}
                onSelect={setDate as any}
                numberOfMonths={2}
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      
      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-96 opacity-100 mt-4 border-t border-gray-200/50" : "max-h-0 opacity-0"}`}>
        <div className="container py-4 flex flex-col gap-4">
          <div className="flex bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--cta-green)] transition-all">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent border-none outline-none text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button 
            className="w-full rounded-full text-white font-medium shadow-md transition-transform active:scale-95" 
            style={{ backgroundColor: "var(--cta-green)" }}
            onClick={() => navigate("/listings/new")}
          >
            Create listing
          </Button>
          <nav className="flex flex-col gap-4 mt-4 px-2">
            <button onClick={() => { navigate("/about"); setMobileMenuOpen(false); }} className="text-left font-medium text-gray-700 hover:text-[var(--cta-green)] transition-colors text-lg">How RentConnect works</button>
            <button onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }} className="text-left font-medium text-gray-700 hover:text-[var(--cta-green)] transition-colors text-lg">Contact</button>
          </nav>
        </div>
      </div>
    </header>
  );
}
