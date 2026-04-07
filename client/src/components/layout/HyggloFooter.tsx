import { useLocation } from "wouter";
import { Facebook, Instagram, MessageSquare } from "lucide-react";

export function HyggloFooter() {
  const [, navigate] = useLocation();

  return (
    <footer className="text-white relative" style={{ backgroundColor: "var(--footer-bg)" }}>
      <div className="container py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Logo Column */}
          <div className="lg:w-1/6">
            <span
              className="text-4xl font-bold tracking-tight inline-block mb-6 lg:mb-0"
              style={{ color: "var(--logo-color)", fontFamily: "var(--font-display)" }}
            >
              RentConnect
            </span>
          </div>

          {/* Links Grid */}
          <div className="lg:w-3/6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div>
              <h4 className="font-bold mb-4">About us</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><button onClick={() => navigate("/about")} className="hover:text-primary-dark transition-colors">About RentConnect</button></li>
                <li><button onClick={() => navigate("/guarantee")} className="hover:text-primary-dark transition-colors">Guarantee</button></li>
                <li><button onClick={() => navigate("/faq")} className="hover:text-primary-dark transition-colors">FAQ's</button></li>
                <li><button onClick={() => navigate("/terms")} className="hover:text-primary-dark transition-colors">Terms and Conditions</button></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="pt-9">
              <ul className="space-y-3 text-sm font-medium">
                <li><button onClick={() => navigate("/privacy")} className="hover:text-primary-dark transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate("/partnerships")} className="hover:text-primary-dark transition-colors">Partnerships</button></li>
                <li className="pt-2"><button onClick={() => navigate("/categories")} className="hover:text-primary-dark transition-colors">All categories</button></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="pt-9">
              <ul className="space-y-3 text-sm font-medium">
                <li><button onClick={() => navigate("/areas")} className="hover:text-primary-dark transition-colors">Areas where <br />RentConnect is used</button></li>
                <li><button onClick={() => navigate("/blog")} className="hover:text-primary-dark transition-colors">RentConnect's blog</button></li>
              </ul>
            </div>

            {/* Column 4 - Countries */}
            <div>
              <h4 className="font-bold mb-4">RentConnect in other countries</h4>
              <ul className="space-y-4 text-xs">
                <li><a href="#" className="hover:text-primary-dark transition-colors">Ønsker du at leje ting i Danmark, kan du besøge hygglo.dk</a></li>
                <li><a href="#" className="hover:text-primary-dark transition-colors">Jos haluat vuokrata tavaroita Suomessa, siirry osoitteeseen hygglo.fi</a></li>
                <li><a href="#" className="hover:text-primary-dark transition-colors">Om du vill hyra saker i Sverige, kan du besöka hygglo.se</a></li>
                <li><a href="#" className="hover:text-primary-dark transition-colors">Hvis du vil leie ting i Norge, kan du besøke hygglo.no</a></li>
              </ul>
            </div>
          </div>

          {/* Right Column - App Badges & Contact */}
          <div className="lg:w-2/6 lg:pl-12">
            <div className="flex gap-3 mb-8">
              {/* Fake App Store Badge */}
              <div className="border border-white/40 rounded-md px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
                 <div className="text-[10px] leading-tight">
                   Download on the<br/>
                   <span className="text-sm font-semibold">App Store</span>
                 </div>
              </div>
              {/* Fake Play Store Badge */}
               <div className="border border-white/40 rounded-md px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
                 <div className="text-[10px] leading-tight">
                   GET IT ON<br/>
                   <span className="text-sm font-semibold">Google Play</span>
                 </div>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <a href="#" className="hover:text-primary-dark transition-colors"><Facebook className="w-6 h-6" /></a>
              <a href="#" className="hover:text-primary-dark transition-colors"><Instagram className="w-6 h-6" /></a>
            </div>

            <div className="text-xs space-y-1 text-white/90">
              <p className="font-semibold text-white">Hygglo Ltd</p>
              <p>Arquen House, 4-6 Spicer Street, St Albans, AL3 4PQ</p>
              <p><a href="mailto:info@hygglo.com" style={{ color: "var(--logo-color)" }} className="hover:underline">info@hygglo.com</a></p>
              <p>Company registration number 09927338</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Floating Chat Widget */}
      <button 
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-all z-50"
        style={{ backgroundColor: "var(--cta-green)" }}
      >
        <MessageSquare className="w-6 h-6 text-primary" />
      </button>
    </footer>
  );
}
