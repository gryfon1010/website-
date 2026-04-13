import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const AREAS = [
  { city: "London", slug: "london", listings: 1250, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop" },
  { city: "Manchester", slug: "manchester", listings: 680, image: "https://images.unsplash.com/photo-1590432859932-995857bd0734?w=600&h=400&fit=crop" },
  { city: "Birmingham", slug: "birmingham", listings: 520, image: "https://images.unsplash.com/photo-1562947959-6e271e0e0a27?w=600&h=400&fit=crop" },
  { city: "Leeds", slug: "leeds", listings: 390, image: "https://images.unsplash.com/photo-1572082387122-77db3f8e0e8a?w=600&h=400&fit=crop" },
  { city: "Glasgow", slug: "glasgow", listings: 340, image: "https://images.unsplash.com/photo-1565626424176-c699f049c963?w=600&h=400&fit=crop" },
  { city: "Liverpool", slug: "liverpool", listings: 310, image: "https://images.unsplash.com/photo-1562947959-6e271e0e0a27?w=600&h=400&fit=crop" },
];

export function AreasPage() {
  const [, navigate] = useLocation();

  return (
    <AppLayout>
      <div className="container py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Areas Where RentConnect is Used</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse items available for rent across the UK. Find something near you!
          </p>
        </div>

        {/* Areas Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {AREAS.map((area) => (
            <Card key={area.slug} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={area.image} 
                  alt={area.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">{area.city}</h3>
                  <p className="text-sm opacity-90">{area.listings}+ listings</p>
                </div>
              </div>
              <div className="p-4">
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/areas/${area.slug}`)}
                >
                  Browse {area.city}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="p-8 bg-primary/5 text-center">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Can't Find Your Area?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're expanding rapidly! If your area isn't listed, you can still search everywhere and find items near you.
          </p>
          <Button size="lg" onClick={() => navigate("/search")}>
            Search All Areas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}

export default AreasPage;
