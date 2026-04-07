import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { Camera, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateListing() {
  return (
    <HyggloLayout>
      <div className="container py-12 max-w-6xl">
        <h1 className="text-4xl font-bold mb-10 tracking-tight text-gray-900">
          List your item
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Form Area */}
          <div className="flex-1 space-y-12">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Select category</h3>
                <select className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 outline-none focus:border-pink-300">
                  <option value="">Select a category</option>
                  <option value="tools">Tools & Equipment</option>
                  <option value="electronics">Electronics</option>
                </select>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4 text-gray-400">Describe your item</h3>
                <div className="space-y-4 opacity-50 pointer-events-none">
                  <div>
                     <label className="text-xs font-semibold text-gray-500 mb-1 block">Title</label>
                     <input type="text" className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white" />
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 mb-1 block">Describe the item in as much detail as possible</label>
                     <textarea className="w-full h-32 p-4 rounded-lg border border-gray-300 bg-white resize-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-400">Pictures</h3>
                <p className="text-xs text-gray-400 mb-4 opacity-50">Upload pictures in landscape format (4:3)<br/>In order for pictures to look good, they should be landscaped. Portrait pictures will not be fully displayed.</p>
                
                <div className="grid grid-cols-4 gap-4 opacity-50 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <Camera className="w-8 h-8 text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-400">Price</h3>
                <p className="text-xs text-gray-400 mb-4 opacity-50">You can offer lower prices for longer bookings. The rental price is calculated according to the lowest possible price level.</p>
                <div className="grid grid-cols-3 gap-4 opacity-50 pointer-events-none">
                   <div>
                     <label className="text-xs font-semibold text-gray-500 mb-1 block">Price for 1 day (required)</label>
                     <div className="relative">
                       <span className="absolute left-4 top-3 text-gray-500">£</span>
                       <input type="text" className="w-full h-12 pl-8 rounded-lg border border-gray-300 bg-white" />
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-gray-500 mb-1 block">Price for 3 days</label>
                     <div className="relative">
                       <span className="absolute left-4 top-3 text-gray-500">£</span>
                       <input type="text" className="w-full h-12 pl-8 rounded-lg border border-gray-300 bg-white" />
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-gray-500 mb-1 block">Price for 7 days</label>
                     <div className="relative">
                       <span className="absolute left-4 top-3 text-gray-500">£</span>
                       <input type="text" className="w-full h-12 pl-8 rounded-lg border border-gray-300 bg-white" />
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-400">Where can the item be handed over?</h3>
                <p className="text-xs text-gray-400 mb-4 opacity-50">Your exact address will not be shown before the rentals is paid and verified. Read more</p>
                <button className="flex items-center gap-2 pl-4 pr-6 py-2.5 rounded-full font-medium text-white shadow-sm opacity-50 pointer-events-none" style={{ backgroundColor: "#B483B8" }}>
                  <Plus className="w-5 h-5" /> Add a location
                </button>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                6
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4 text-gray-400">Cancellation Terms</h3>
                <div className="flex gap-8 mb-4 opacity-50 pointer-events-none">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center bg-gray-200">
                    </div>
                    <span className="text-gray-500 font-medium text-sm">Flexible</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                    <span className="text-gray-500 font-medium text-sm">Medium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                    <span className="text-gray-500 font-medium text-sm">Strict</span>
                  </label>
                </div>
                <div className="bg-white p-0 opacity-50 pointer-events-none">
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-bold text-gray-800">Flexible </span>
                    - If cancelled 2 days before the rental period, 100% of the rental amount will be refunded. If cancelled the day before the rental period, 50% of the rental amount will be refunded.
                  </p>
                  <a href="#" className="text-sm hover:underline" style={{ color: "var(--logo-color)" }}>Read more about the cancellation policy</a>
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                7
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4 text-gray-400">Value of item</h3>
                <div className="opacity-50 pointer-events-none">
                   <div className="relative w-64 mb-2">
                     <span className="absolute left-4 top-3 text-gray-500">£</span>
                     <input type="text" className="w-full h-12 pl-8 rounded-lg border border-gray-300 bg-white" />
                   </div>
                   <p className="text-sm text-gray-400 mb-1">If you would sell it today on e.g. Facebook Marketplace - what would it be worth?</p>
                   <a href="#" className="text-sm hover:underline" style={{ color: "var(--logo-color)" }}>Read more about item valuation</a>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pl-14 pb-12">
               <Button className="rounded-full px-8 py-6 text-sm font-semibold text-white shadow-sm opacity-50 pointer-events-none" style={{ backgroundColor: "var(--cta-green)" }}>
                 Publish listing!
               </Button>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[340px] space-y-6">
            
            {/* Download app card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
               <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center text-gray-400 text-sm font-medium">
                 [ Phone Illustration ]
               </div>
               <div className="p-6">
                 <h3 className="text-xl font-bold mb-3 text-gray-900 tracking-tight">Download our app!</h3>
                 <p className="text-sm text-gray-600 mb-4">This is a good time to download our app to make it easier for you.</p>
                 <ul className="space-y-3 mb-6">
                   <li className="flex gap-2 text-xs text-gray-600">
                     <div className="mt-1 w-1 h-1 bg-gray-800 rounded-full flex-shrink-0"></div>
                     It is easier to take pictures with your phone
                   </li>
                   <li className="flex gap-2 text-xs text-gray-600">
                     <div className="mt-1 w-1 h-1 bg-gray-800 rounded-full flex-shrink-0"></div>
                     You will receive notifications when someone contacts you
                   </li>
                   <li className="flex gap-2 text-xs text-gray-600">
                     <div className="mt-1 w-1 h-1 bg-gray-800 rounded-full flex-shrink-0"></div>
                     It is much easier to post ads with the app. Click on one of the buttons to download or continue below.
                   </li>
                 </ul>
                 <div className="flex gap-2">
                   <div className="border border-gray-300 rounded-md px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50 flex-1">
                     <div className="text-[10px] leading-tight text-gray-800">
                       Download on the<br/>
                       <span className="text-sm font-semibold">App Store</span>
                     </div>
                   </div>
                   <div className="border border-gray-300 rounded-md px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50 flex-1">
                     <div className="text-[10px] leading-tight text-gray-800">
                       GET IT ON<br/>
                       <span className="text-sm font-semibold">Google Play</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Dropped off locations card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm p-6 text-center">
               <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center text-gray-400 text-xs">
                 [ Map Icon ]
               </div>
               <h3 className="text-lg font-bold mb-2 text-gray-900 tracking-tight">Can your item be dropped off in several places?</h3>
               <p className="text-xs text-gray-600">
                 You might be able to bring the item to work and meet up there? Add location(s) below to increase the chance of getting your item rented out!
               </p>
            </div>

          </div>
        </div>
      </div>
    </HyggloLayout>
  );
}
