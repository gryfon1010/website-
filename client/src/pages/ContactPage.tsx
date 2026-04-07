import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { Mail, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

const managementTeam = [
  {
    name: "Ola Degerfors",
    role: "CEO",
    email: "ola.degerfors@rentconnect.dev",
    image: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Emma Norborg",
    role: "Chief Financial Officer",
    email: "emma.norborg@rentconnect.dev",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Axel Hellström",
    role: "Head of Customer Success",
    email: "axel.hellstrom@rentconnect.dev",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Victor Larsson",
    role: "CTO",
    email: "victor.larsson@rentconnect.dev",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Henrik Fråsén",
    role: "Head of Product & Growth",
    email: "henrik.frasen@rentconnect.dev",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
  },
];

export default function ContactPage() {
  const [, navigate] = useLocation();

  return (
    <HyggloLayout>
      <div className="container py-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left sidebar - Navigation */}
          <div className="lg:w-48 flex-shrink-0">
            <nav className="space-y-4">
              <button onClick={() => navigate("/about")} className="text-left text-sm font-medium text-[var(--footer-bg)] hover:underline block">
                About us
              </button>
              <button onClick={() => navigate("/mission")} className="text-left text-sm font-medium text-[var(--footer-bg)] hover:underline block">
                Our mission
              </button>
              <button onClick={() => navigate("/contact")} className="text-left text-sm font-medium text-[var(--logo-color)] hover:underline block">
                Contact Us
              </button>
              <button onClick={() => navigate("/partnerships")} className="text-left text-sm font-medium text-[var(--footer-bg)] hover:underline block">
                Partnerships
              </button>
              <button onClick={() => navigate("/terms")} className="text-left text-sm font-medium text-[var(--footer-bg)] hover:underline block">
                Terms of Use
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 max-w-3xl">
            <h1
              className="text-4xl font-bold mb-6 text-gray-900 tracking-tight"
            >
              Contact Us
            </h1>

            {/* Customer service info */}
            <div className="space-y-4 mb-10 text-gray-800">
              <p className="text-sm leading-relaxed">
                Customer service is open from 8:00 AM (CET) to 8:00 PM (CET) Monday through Saturday and from 9:00 AM (CET) to 5:00 PM (CET) on Sundays.
              </p>

              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" style={{ color: "var(--footer-bg)" }} />
                <a href="mailto:info@rentconnect.dev" className="text-sm font-medium hover:underline" style={{ color: "var(--footer-bg)" }}>
                  info@rentconnect.dev
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" style={{ color: "var(--footer-bg)" }} />
                <button className="text-sm font-medium hover:underline" style={{ color: "var(--footer-bg)" }}>
                  Start chat
                </button>
              </div>
            </div>

            {/* Management team */}
            <div>
              <h2
                className="text-2xl font-bold mb-4 text-gray-900 tracking-tight"
              >
                Management team
              </h2>
              <p className="text-sm text-gray-800 mb-10">
                If you want to reach a specific person then you can reach us as below.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8">
                {managementTeam.map((member) => (
                  <div key={member.name} className="flex flex-col items-center text-center">
                     <div className="w-36 h-36 mb-4 rounded-full overflow-hidden grayscale">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-light text-xl text-gray-800 tracking-wide mb-1">{member.name}</h3>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{member.role}</p>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-xs hover:underline mt-1"
                      style={{ color: "var(--footer-bg)" }}
                    >
                      {member.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HyggloLayout>
  );
}
