import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

const categories = [
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "tools_garden", name: "Tools & Garden", icon: "🔨" },
  { id: "sports_outdoors", name: "Sports & Outdoors", icon: "⚽" },
  { id: "party_events", name: "Party & Events", icon: "🎉" },
  { id: "home_living", name: "Home & Living", icon: "🏠" },
  { id: "fashion_accessories", name: "Fashion & Accessories", icon: "👗" },
  { id: "toys_games", name: "Toys & Games", icon: "🎮" },
  { id: "books_media", name: "Books & Media", icon: "📚" },
];

export function CategoriesPage() {
  const [, navigate] = useLocation();

  return (
    <AppLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">All Categories</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/search?category=${category.id}`)}
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                Browse {category.name} items
              </p>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default CategoriesPage;
