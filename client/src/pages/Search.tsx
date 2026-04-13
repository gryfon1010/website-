import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { useLocation } from "wouter";
import { Star, MapPin, Calendar, Bookmark, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getItems } from "@/services/items";
import { formatCurrency } from "@/lib/format";

export default function Search() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("q") || "";
  const categoryFilter = params.get("category") || "";
  const locationFilter = params.get("location") || "";

  const { data: items, isLoading, error } = useQuery({
    queryKey: ["items", { q: searchQuery, category: categoryFilter, location: locationFilter }],
    queryFn: () => getItems({
      q: searchQuery || undefined,
      category: categoryFilter || undefined,
      location: locationFilter || undefined,
    }),
  });

  const displayTitle = useMemo(() => {
    if (searchQuery) return `Search: "${searchQuery}"`;
    if (categoryFilter) return categoryFilter;
    if (locationFilter) return `Items near ${locationFilter}`;
    return "All Items";
  }, [searchQuery, categoryFilter, locationFilter]);

  return (
    <HyggloLayout>
      <div className="container py-6 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-2 flex gap-1 items-center">
           <button onClick={() => navigate("/categories")} className="hover:underline">All categories</button>
           {categoryFilter && (
             <>
               <span>&gt;</span>
               <button className="hover:underline">{categoryFilter}</button>
             </>
           )}
           {searchQuery && (
             <>
               <span>&gt;</span>
               <span className="text-gray-900">Search results</span>
             </>
           )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">{displayTitle}</h1>
             
             <div className="flex flex-col gap-3 text-sm text-gray-800 font-medium mb-6">
                <button className="flex items-center gap-2 hover:text-primary transition-colors text-left" onClick={() => navigate("/areas/london")}>
                  <MapPin className="w-4 h-4" /> Near <span className="font-bold">London</span> <span style={{ color: "var(--cta-green)" }}>(change)</span>
                </button>
                <button className="flex items-center gap-2 transition-colors text-left" style={{ color: "var(--cta-green)" }}>
                  <Calendar className="w-4 h-4" /> Select dates
                </button>
             </div>

             <div className="text-sm text-gray-600 space-y-6">
                <p>Browse items available for rent in your area. Find exactly what you need at affordable prices.</p>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Am I guaranteed if I rent?</h4>
                  <p>Yes. Damages are covered without any excess. <button className="hover:underline" style={{ color: "var(--logo-color)" }} onClick={() => navigate("/guarantee")}>Read more</button></p>
                </div>

                <div>
                   <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Popular Searches</h4>
                   <div className="flex flex-col gap-1 items-start">
                     <button className="text-sm hover:underline" style={{ color: "var(--footer-bg)" }} onClick={() => navigate("/search?q=Pressure+Washer")}>Pressure Washer</button>
                     <button className="text-sm hover:underline" style={{ color: "var(--footer-bg)" }} onClick={() => navigate("/search?q=Drill")}>Drills</button>
                     <button className="text-sm hover:underline" style={{ color: "var(--footer-bg)" }} onClick={() => navigate("/search?q=Camera")}>Cameras</button>
                   </div>
                </div>
             </div>
          </div>

          {/* Main Grid Area */}
          <div className="flex-1">
             {/* Toggle List/Map */}
             <div className="flex justify-center mb-6">
               <div className="flex rounded-full overflow-hidden border border-[var(--footer-bg)]">
                 <button className="px-6 py-1.5 text-sm font-semibold text-white transition-colors" style={{ backgroundColor: "var(--footer-bg)" }}>List</button>
                 <button className="px-6 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">Map</button>
               </div>
             </div>

             {/* Loading State */}
             {isLoading && (
               <div className="flex items-center justify-center py-20">
                 <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                 <span className="ml-3 text-gray-500">Loading items...</span>
               </div>
             )}

             {/* Error State */}
             {error && (
               <Card className="p-8 text-center">
                 <p className="text-red-500 mb-4">Failed to load items</p>
                 <Button onClick={() => window.location.reload()}>Try Again</Button>
               </Card>
             )}

             {/* Empty State */}
             {!isLoading && items?.length === 0 && (
               <Card className="p-12 text-center">
                 <h3 className="text-2xl font-bold mb-2">No items found</h3>
                 <p className="text-gray-500 mb-6">
                   {searchQuery 
                     ? `No results for "${searchQuery}". Try a different search term.`
                     : "No items available in this category yet."
                   }
                 </p>
                 <Button onClick={() => navigate("/search")}>Browse All Items</Button>
               </Card>
             )}

             {/* Results Grid */}
             {!isLoading && items && items.length > 0 && (
               <>
                 <div className="text-sm text-gray-600 mb-4">{items.length} items found</div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
                   {items.map((item) => (
                     <div 
                        key={item.id} 
                        className="group cursor-pointer flex flex-col"
                        onClick={() => navigate(`/items/${item.id}`)}
                     >
                        <div className="relative aspect-[4/3] bg-gray-100 rounded-xl mb-3 overflow-hidden border border-gray-200">
                           <img 
                             src={item.images[0] || "https://images.unsplash.com/photo-1584824388147-38435d883cb0?w=400&h=300&fit=crop"} 
                             alt={item.title} 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                           />
                           
                           {/* Top Badges */}
                           <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                              {item.reviewCount > 5 && (
                                <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded bg-[var(--footer-bg)]">POPULAR</span>
                              )}
                              <button 
                                 className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--footer-bg)] hover:scale-110 transition-transform"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/favorites");
                                 }}
                              >
                                <Bookmark className="w-4 h-4" />
                              </button>
                           </div>

                           {/* Rating Stars */}
                           <div className="absolute bottom-2 left-2 flex gap-0.5 text-red-500">
                              {[...Array(5)].map((_, i) => (
                                 <Heart key={i} className={`w-3.5 h-3.5 ${i < Math.round(item.rating) ? "fill-current" : "fill-current opacity-30"}`} />
                              ))}
                           </div>
                           <div className="absolute -bottom-3 right-3 w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm z-10 hover:scale-110 transition-transform">
                              <img src={item.owner.avatar || `https://i.pravatar.cc/150?u=${item.id}`} className="w-full h-full object-cover" />
                           </div>
                        </div>
                        <div className="flex-1 flex flex-col pt-2">
                           <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight mb-1 group-hover:text-[var(--cta-green)] transition-colors">{item.title}</h3>
                           <p className="text-xs text-gray-500 truncate mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {item.distanceKm} km away ({item.location})</p>
                           <div className="mt-auto pt-2">
                              <p className="text-sm font-bold text-gray-900">{formatCurrency(item.pricePerDay)}/day</p>
                              {item.rating > 0 && (
                                <p className="text-xs text-gray-500 mt-1">★ {item.rating} ({item.reviewCount} reviews)</p>
                              )}
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
    </HyggloLayout>
  );
}
