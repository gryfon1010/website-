import { useState } from "react";
import { useLocation } from "wouter";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { ChevronRight } from "lucide-react";

export default function BookingsPage() {
  const [, navigate] = useLocation();

  return (
    <HyggloLayout>
      <div className="container py-12 max-w-4xl mx-auto text-center">
        <h1
          className="text-4xl font-bold mb-6 tracking-tight text-gray-900"
        >
          Bookings
        </h1>

        <div className="mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3 tracking-tight text-gray-900">Your bookings are listed here</h2>
          <p className="text-sm text-gray-600 font-medium">
            Keep in mind that it is nice to write something if you cancel a request. If you have any questions - please contact us on the support team!
          </p>
        </div>

        <div className="space-y-4 text-left">
          <button className="w-full flex items-center justify-between py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors px-4 rounded-t-lg group">
            <div>
              <p className="text-lg font-medium text-gray-800 mb-1">Current bookings (0)</p>
              <p className="text-sm text-gray-500">Chats, requests and bookings</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>

          <button className="w-full flex items-center justify-between py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors px-4 group">
            <div>
              <p className="text-lg font-medium text-gray-800 mb-1">Completed bookings (0)</p>
              <p className="text-sm text-gray-500">All completed bookings. Remember to give a review!</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>

          <button className="w-full flex items-center justify-between py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors px-4 group">
            <div>
              <p className="text-lg font-medium text-gray-800 mb-1">Outdated bookings</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </div>
    </HyggloLayout>
  );
}
