import { useLocation } from "wouter";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const [, navigate] = useLocation();

  return (
    <HyggloLayout>
      <div className="container py-8 max-w-4xl mx-auto min-h-[60vh]">
        <button 
          onClick={() => navigate("/profile")} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </button>

        <h1 className="text-4xl font-bold mb-8 tracking-tight text-gray-900">
          My favorites
        </h1>

        <div className="flex flex-col items-center justify-center p-16 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed mt-12">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No favorites yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
            When you find items you like, click the heart icon to save them here for later.
          </p>
          <Button 
            className="rounded-full px-8 py-6 text-lg font-medium shadow-md transition-all active:scale-95 text-gray-900 border-0" 
            style={{ backgroundColor: "var(--cta-green)" }}
            onClick={() => navigate("/search")}
          >
            Start exploring
          </Button>
        </div>
      </div>
    </HyggloLayout>
  );
}
