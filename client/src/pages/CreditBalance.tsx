import { useLocation } from "wouter";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { ArrowLeft, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";

export default function CreditBalancePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <HyggloLayout>
      <div className="container py-8 max-w-3xl mx-auto min-h-[60vh]">
        <button 
          onClick={() => navigate("/profile")} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </button>

        <h1 className="text-4xl font-bold mb-10 tracking-tight text-gray-900">
          Credit balance
        </h1>

        <div className="bg-[var(--logo-color)] text-white p-10 rounded-3xl shadow-lg relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Ticket className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-lg font-medium text-white/80 mb-2">Available Balance</h2>
            <div className="text-6xl font-bold tracking-tight mb-8">
              £0<span className="text-3xl text-white/60">.00</span>
            </div>
            
            <p className="max-w-md text-white/90 leading-relaxed mb-8">
              Use your rent credits to easily pay for rentals on the platform. Credits can be earned through promotions.
            </p>

            <Button 
               className="rounded-full px-8 py-6 text-lg font-medium shadow-md transition-all active:scale-95 text-gray-900 border-0 flex items-center gap-2" 
               style={{ backgroundColor: "var(--cta-green)" }}
            >
               <Plus className="w-5 h-5" /> Redeem Code
            </Button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
           <h3 className="text-xl font-bold mb-6 text-gray-900">Recent transactions</h3>
           <div className="text-center py-12 text-gray-500">
             No recent transactions found.
           </div>
        </div>

      </div>
    </HyggloLayout>
  );
}
