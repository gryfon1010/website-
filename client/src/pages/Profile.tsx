import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/features/auth/AuthContext";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { toast } from "sonner";
import {
  Flag,
  User,
  Bookmark,
  Ticket,
  LockOpen,
  MessageCircle,
  HelpCircle,
  FileText,
  UserX,
  ChevronRight,
  Paintbrush
} from "lucide-react";

export default function Profile() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires contacting support for security verification.");
  };

  return (
    <HyggloLayout>
      <div className="container py-12 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 tracking-tight text-gray-900">
          My profile
        </h1>

        <div className="space-y-4 mb-10">
          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => navigate("/areas")}>
            <div className="flex items-center gap-6">
              <Flag className="w-6 h-6 text-gray-600 stroke-[1.5]" />
              <span className="text-base text-gray-800">Current country: GB</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => navigate("/profile/edit")}>
            <div className="flex items-center gap-6">
              <User className="w-6 h-6 text-gray-600 stroke-[1.5]" />
              <div className="text-left">
                <p className="text-base text-gray-800">Edit profile</p>
                <p className="text-sm text-gray-500 mt-0.5">Edit your contact details</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => navigate("/favorites")}>
            <div className="flex items-center gap-6">
              <Bookmark className="w-6 h-6 text-gray-600 stroke-[1.5]" />
              <span className="text-base text-gray-800">My favorites</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => navigate("/credit-balance")}>
            <div className="flex items-center gap-6">
              <Ticket className="w-6 h-6 text-gray-600 stroke-[1.5]" />
              <span className="text-base text-gray-800">Credit balance</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={logout}>
            <div className="flex items-center gap-6">
              <LockOpen className="w-6 h-6 text-gray-600 stroke-[1.5]" />
              <span className="text-base text-gray-800">Sign out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Help section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 tracking-tight text-gray-900">Help</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => navigate("/contact")}>
              <div className="flex items-center gap-6">
                <MessageCircle className="w-6 h-6 text-gray-600 stroke-[1.5]" />
                <div className="text-left">
                  <p className="text-base text-gray-800">Start chat</p>
                  <p className="text-sm text-gray-500 mt-0.5">Contact RentConnect</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => navigate("/faq")}>
              <div className="flex items-center gap-6">
                <HelpCircle className="w-6 h-6 text-gray-600 stroke-[1.5]" />
                <div className="text-left">
                  <p className="text-base text-gray-800">Frequently asked questions</p>
                  <p className="text-sm text-gray-500 mt-0.5">Here you will find information about most things about RentConnect and our services.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => navigate("/terms")}>
              <div className="flex items-center gap-6">
                <FileText className="w-6 h-6 text-gray-600 stroke-[1.5]" />
                <div className="text-left">
                  <p className="text-base text-gray-800">Read our terms and conditions</p>
                  <p className="text-sm text-gray-500 mt-0.5">Terms and Conditions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors text-gray-800" onClick={handleDeleteAccount}>
              <div className="flex items-center gap-6">
                <UserX className="w-6 h-6 text-gray-600 stroke-[1.5]" />
                <span className="text-base">Delete account</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Beta section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 tracking-tight text-gray-900">Beta</h2>
           <button
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              toast.success(`Appearance changed to ${!isDarkMode ? "Dark" : "Light"} mode.`);
            }}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-6">
              <Paintbrush className="w-6 h-6 text-gray-600 stroke-[1.5]" />
              <span className="text-base text-gray-800">Appearance: {isDarkMode ? "Dark" : "Light"}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </HyggloLayout>
  );
}
