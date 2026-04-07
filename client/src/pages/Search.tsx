import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { useLocation } from "wouter";
import { Star, MapPin, Calendar, Bookmark, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data to match the screenshot grid
const items = [
  { id: 1, title: "K2 karcher pressure washer", location: "Knightsbridge & Belgravia, Westminster", distance: "1.4 mi", price: "£9 - 10/day", popular: true, rating: 5 },
  { id: 2, title: "Bosch aquatak pressure washer", location: "Vauxhall, Lambeth", distance: "1.6 mi", price: "£5 - 10/day", popular: true, rating: 5 },
  { id: 3, title: "Bosch pressure washer easy aquatak 1...", location: "North Walworth, Southwark", distance: "1.7 mi", price: "£5 - 10/day", popular: true, rating: 5 },
  { id: 4, title: "Karcher k5 compact home high pressu...", location: "Oval, Lambeth", distance: "1.9 mi", price: "£11 - 22/day", popular: true, rating: 4 },
  { id: 5, title: "Karcher k5 premium full control plus h...", location: "Newington, Southwark", distance: "2.1 mi", price: "£15 - 27/day", popular: true, rating: 5 },
  { id: 6, title: "Karcher power washer", location: "Nine Elms, Wandsworth", distance: "2.1 mi", price: "£5 - 9/day", popular: false, rating: 0 },
  { id: 7, title: "Karcher pressure washer", location: "Stockwell West & Larkhall...", distance: "2.2 mi", price: "£17 - 35/day", popular: true, rating: 5 },
  { id: 8, title: "Worx hydroshot cordless pressure wa...", location: "Battersea Park, Wandsworth", distance: "2.4 mi", price: "£9 - 22/day", popular: false, rating: 0 },
  { id: 9, title: "Karcher k5 power control pressure wa...", location: "Myatt's Fields, Lambeth", distance: "2.4 mi", price: "£10 - 18/day", popular: true, rating: 5 },
];

export default function Search() {
  const [, navigate] = useLocation();

  return (
    <HyggloLayout>
      <div className="container py-6 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-2 flex gap-1 items-center">
           <button onClick={() => navigate("/categories")} className="hover:underline">All categories</button>
           <span>&gt;</span>
           <button className="hover:underline">Garden</button>
           <span>&gt;</span>
           <button className="hover:underline">Garden Machinery</button>
           <span>&gt;</span>
           <span className="text-gray-900">Pressure Washer</span>
        </div>

        {/* Global info row */}
        <div className="flex items-center gap-2 text-xs mb-4">
          <span className="font-bold text-gray-900">4.92</span>
          <div className="flex text-red-500">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
          </div>
          <span className="text-gray-500">(711) <button className="underline">See all reviews</button></span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Pressure Washer</h1>
             
             <div className="flex flex-col gap-3 text-sm text-gray-800 font-medium mb-6">
                <button className="flex items-center gap-2 hover:text-primary transition-colors text-left" onClick={() => navigate("/areas/london")}>
                  <MapPin className="w-4 h-4" /> Near <span className="font-bold">London</span> <span style={{ color: "var(--cta-green)" }}>(change)</span>
                </button>
                <button className="flex items-center gap-2 transition-colors text-left" style={{ color: "var(--cta-green)" }}>
                  <Calendar className="w-4 h-4" /> Select dates
                </button>
             </div>

             <div className="text-sm text-gray-600 space-y-6">
                <p>Rent a pressure washer for effortless cleaning of outdoor surfaces, vehicles, and boats. Easily customise with accessories to meet your specific needs.</p>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Am I guaranteed if I rent pressure washer?</h4>
                  <p>Yes. Damages are covered without any excess. <button className="hover:underline" style={{ color: "var(--logo-color)" }} onClick={() => navigate("/guarantee")}>Read more</button></p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1">What does it cost to rent pressure washer?</h4>
                  <p>You can rent pressure washer for approx £10 per day or £37 for a week.</p>
                </div>

                <div>
                   <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Popular Searches</h4>
                   <div className="flex flex-col gap-1 items-start">
                     <button className="text-sm hover:underline" style={{ color: "var(--footer-bg)" }}>Kärcher</button>
                     <button className="text-sm hover:underline" style={{ color: "var(--footer-bg)" }}>Nilfisk</button>
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

             {/* Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
               {items.map((item) => (
                 <div 
                    key={item.id} 
                    className="group cursor-pointer flex flex-col"
                    onClick={() => navigate(`/items/${item.id}`)}
                 >
                    <div className="relative aspect-[4/3] bg-gray-100 rounded-xl mb-3 overflow-hidden border border-gray-200">
                       <img src={`https://images.unsplash.com/photo-1584824388147-38435d883cb0?w=400&h=300&fit=crop`} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                       
                       {/* Top Badges */}
                       <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                          {item.popular ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded bg-[var(--footer-bg)]">VERY POPULAR</span>
                          ) : (
                            <span></span>
                          )}
                          <button 
                             className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--footer-bg)] hover:scale-110 transition-transform"
                             onClick={(e) => {
                                e.stopPropagation(); // prevent navigation to product detail
                                navigate("/favorites");
                             }}
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                       </div>

                       {/* Interaction Overlays (Hearts/Avatar) */}
                       <div className="absolute bottom-2 left-2 flex gap-1 text-[var(--logo-color)]">
                          {[...Array(5)].map((_, i) => (
                             <Heart key={i} className={`w-3.5 h-3.5 ${i < item.rating ? "fill-current" : "fill-current opacity-30"}`} />
                          ))}
                       </div>
                       <div className="absolute -bottom-3 right-3 w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm z-10 hover:scale-110 transition-transform">
                          <img src={`https://i.pravatar.cc/150?u=${item.id}`} className="w-full h-full object-cover" />
                       </div>
                    </div>
                    <div className="flex-1 flex flex-col pt-2">
                       <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight mb-1 group-hover:text-[var(--cta-green)] transition-colors">{item.title}</h3>
                       <p className="text-xs text-gray-500 truncate mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {item.distance} ({item.location})</p>
                       <div className="mt-auto pt-2">
                          <p className="text-sm font-bold text-gray-900">{item.price}</p>
                       </div>
                    </div>
                 </div>
               ))}
             </div>

             <div className="mt-12 flex justify-center">
               <button className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: "var(--footer-bg)" }}>
                 Show more
               </button>
             </div>
          </div>
        </div>
      </div>
    </HyggloLayout>
  );
}
