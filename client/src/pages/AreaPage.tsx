import { AppLayout } from "@/components/layout/AppLayout";

export function AreaPage({ city }: { city: string }) {
  return (
    <AppLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-4">Rent in {city}</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Discover amazing items available for rent in {city}
        </p>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Browse listings available in {city} and surrounding areas
          </p>
          <a href={`/search?location=${encodeURIComponent(city)}`} className="text-primary hover:underline">
            View all items in {city} →
          </a>
        </div>
      </div>
    </AppLayout>
  );
}

export default AreaPage;
