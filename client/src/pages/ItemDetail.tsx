import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthContext";
import {
  Heart,
  MapPin,
  Star,
  Shield,
  Clock,
  Calendar as CalendarIcon,
  MessageCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getItem } from "@/services/items";
import { formatCurrency } from "@/lib/format";

// Helper function to get days in month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// Helper function to get first day of month
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

// Generate calendar days
const generateCalendarDays = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];
  
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, disabled: true });
  }
  
  // Add actual days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isDisabled = date < today;
    days.push({ day, disabled: isDisabled });
  }
  
  return days;
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Heart
          key={i}
          className={`w-4 h-4 ${i < rating ? "fill-red-500 text-red-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function ItemDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<{start: string; end: string} | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if item is in favorites on mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favorite = favorites.find((f: any) => f.itemId === params.id);
    setIsFavorite(!!favorite);
  }, [params.id]);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", params.id],
    queryFn: () => getItem(params.id!),
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <HyggloLayout>
        <div className="container py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </HyggloLayout>
    );
  }

  if (error || !item) {
    return (
      <HyggloLayout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Button onClick={() => navigate("/search")}>Browse all items</Button>
        </div>
      </HyggloLayout>
    );
  }

  const images = item.images.length > 0 ? item.images : ["https://via.placeholder.com/800x600"];
  const dayCount = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  const subtotal = item.pricePerDay * dayCount;
  const serviceFee = Math.round(subtotal * 0.08);
  const totalPrice = subtotal + serviceFee;

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const clickedDate = `${year}-${month}-${dayStr}`;
    
    if (!selectedDates || (selectedDates.start && selectedDates.end)) {
      // Start new selection
      setSelectedDates({ start: clickedDate, end: '' });
      setStartDate(clickedDate);
      setEndDate('');
    } else if (!selectedDates.end) {
      // Complete the range
      if (clickedDate >= selectedDates.start) {
        setSelectedDates({ start: selectedDates.start, end: clickedDate });
        setEndDate(clickedDate);
      } else {
        // If clicked date is before start, make it the new start
        setSelectedDates({ start: clickedDate, end: '' });
        setStartDate(clickedDate);
        setEndDate('');
      }
    }
  };

  const isDateInRange = (day: number | null): boolean => {
    if (!day || !selectedDates?.start || !selectedDates?.end) return false;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const date = `${year}-${month}-${dayStr}`;
    return date >= selectedDates.start && date <= selectedDates.end;
  };

  const isStartDate = (day: number | null): boolean => {
    if (!day || !selectedDates?.start) return false;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}` === selectedDates.start;
  };

  const isEndDate = (day: number | null): boolean => {
    if (!day || !selectedDates?.end) return false;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}` === selectedDates.end;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Handle booking request
  const handleBookRequest = () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates first");
      return;
    }
    
    toast.success("Booking request initiated!", {
      description: `You're requesting to book from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
    });
    
    console.log('Booking request:', {
      itemId: item.id,
      startDate,
      endDate,
      dayCount,
      totalPrice
    });
  };

  // Handle save to favorites
  const handleSaveToFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const existingIndex = favorites.findIndex((f: any) => f.itemId === item.id);
    
    if (existingIndex > -1) {
      // Remove from favorites
      favorites.splice(existingIndex, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(false);
      toast.success("Removed from favorites", {
        description: `${item.title} has been removed from your favorites.`
      });
    } else {
      // Add to favorites
      const favorite = {
        id: `fav-${Date.now()}`,
        itemId: item.id,
        userId: user?.id || 'guest',
        item: item,
        createdAt: new Date().toISOString()
      };
      favorites.push(favorite);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Saved to favorites!", {
        description: `${item.title} has been added to your favorites.`
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  };

  // Handle message owner
  const handleMessageOwner = async () => {
    if (!user) {
      toast.error("Please login to send messages");
      navigate('/login');
      return;
    }

    try {
      // Create or get conversation
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      
      const conversation = await response.json();
      
      // Navigate to dashboard with conversation
      navigate(`/dashboard?tab=messages&conversationId=${conversation.id}`);
      toast.success("Opening chat...");
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error("Failed to open chat. Please try again.");
    }
  };

  return (
    <HyggloLayout>
      <div className="container py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-gray-100">
            <img
              src={images[currentImageIndex]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition-smooth"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition-smooth"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-smooth ${
                    index === currentImageIndex
                      ? "border-primary"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={image} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and basic info */}
            <div>
              <h1
                className="text-3xl font-bold mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-red-500 text-red-500" />
                  {item.rating} ({item.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <RatingStars rating={Math.min(5, Math.floor(item.rating))} />
              </div>
            </div>

            {/* Owner info */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {item.owner?.name?.charAt(0) || "O"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{item.owner?.name || "Owner"}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.owner?.verificationStatus || "Verified"} owner
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2" onClick={handleMessageOwner}>
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </Card>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Features */}
            {item.features && item.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Features</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {item.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Guaranteed</h3>
                    <p className="text-sm text-muted-foreground">
                      Damages are covered without any excess. Full protection for both renter and owner.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Flexible hours</h3>
                    <p className="text-sm text-muted-foreground">
                      Arrange pickup and drop-off times that work for you.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cancellation policy */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Cancellation policy</h2>
              <p className="text-muted-foreground">{item.cancellationPolicy}</p>
            </div>
          </div>

          {/* Right sidebar - Booking */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="mb-6">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(item.pricePerDay)}
                  <span className="text-sm font-normal text-muted-foreground">/day</span>
                </p>
              </div>

              {/* Big Visual Calendar */}
              <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 shadow-lg">
                <div className="p-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={prevMonth}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-smooth"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-smooth"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth()).map((date, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date.day)}
                        disabled={date.disabled}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all
                          ${!date.day ? 'invisible' : ''}
                          ${date.disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-primary/20 cursor-pointer'}
                          ${isDateInRange(date.day) ? 'bg-primary text-white hover:bg-primary' : ''}
                          ${isStartDate(date.day) ? 'bg-green-500 text-white ring-2 ring-green-300' : ''}
                          ${isEndDate(date.day) ? 'bg-green-500 text-white ring-2 ring-green-300' : ''}
                          ${!isDateInRange(date.day) && !isStartDate(date.day) && !isEndDate(date.day) && !date.disabled ? 'bg-white' : ''}
                        `}
                      >
                        {date.day}
                      </button>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-primary rounded"></div>
                      <span>Range</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span>Unavailable</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Selected dates display */}
              {(startDate || endDate) && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800">Selected Dates</span>
                  </div>
                  <div className="text-sm text-green-700">
                    {startDate && <div>From: {new Date(startDate).toLocaleDateString()}</div>}
                    {endDate && <div>To: {new Date(endDate).toLocaleDateString()}</div>}
                    {dayCount > 0 && <div className="mt-2 font-semibold">{dayCount} days total</div>}
                  </div>
                </div>
              )}

              {/* Price breakdown */}
              {(startDate && endDate) && (
                <div className="space-y-2 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(item.pricePerDay)} x {dayCount} days
                    </span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}

              <Button className="btn-cta w-full mb-3" size="lg" onClick={handleBookRequest}>
                Request to book
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleSaveToFavorites}>
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
                {isFavorite ? 'Saved to favorites' : 'Save to favorites'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                You won't be charged yet
              </p>
            </Card>
          </div>
        </div>
      </div>
    </HyggloLayout>
  );
}
