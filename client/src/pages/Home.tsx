import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, MapPin, Star, Bookmark, Shield, PiggyBank, Clock, Leaf, Users, Award, Globe } from "lucide-react";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getItems } from "@/services/items";
import { formatCurrency } from "@/lib/format";

// Mock testimonials data
const testimonials = [
  {
    id: 1,
    time: "48 minutes ago",
    rating: 5,
    comment: "Good communication",
    user: "Boris W",
    item: "Makita DUH523Z LXT 18V Cordless Hedge Trimmer",
  },
  {
    id: 2,
    time: "57 minutes ago",
    rating: 5,
    comment: "Great communication, lens as described, would recommend A+",
    user: "Ali M",
    item: "Fujifilm XF 16-55mm 1:2.8 R LM WR",
  },
  {
    id: 3,
    time: "1 hour ago",
    rating: 5,
    comment: "Hi There, apologies for the cancellation the client has requested to reschedule...",
    user: "Will W",
    item: "Avenger Junior Boom Arm",
  },
  {
    id: 4,
    time: "1 hour ago",
    rating: 5,
    comment: "Perfect transaction! Item exactly as described.",
    user: "Sarah K",
    item: "DJI Mini 3 Pro Drone",
  },
];

// Feature cards data
const features = [
  {
    icon: Award,
    title: "Top Rated Enterprise Solutions from 2025",
    description: "Looking for inspiration for your next gala or summit? Have a look at our premier services utilized in leading tech conferences.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
  },
  {
    icon: Users,
    title: "Anwen: EventCraft scaled our annual summit effortlessly",
    description: "Leveraging EventCraft's enterprise suite saved our team hundreds of hours and allowed us to focus on what matters most: content and networking.",
    image: "https://images.unsplash.com/photo-1515169065868-28471c8dbf4c?w=800&h=600&fit=crop",
  },
  {
    icon: Globe,
    title: "Over a Million Attendees across Seven Countries",
    description: "We want enterprises to focus on strategy. EventCraft's mission is to make it intuitive and robust to orchestrate any event, anywhere, without compromise.",
    image: "https://images.unsplash.com/photo-1475721025505-231362024b89?w=800&h=600&fit=crop",
  },
];

// Why choose Hygglo data
const whyChooseHygglo = [
  {
    icon: Shield,
    title: "Everything is guaranteed",
    description: "A protection for both the person who rents and the person who rents out",
  },
  {
    icon: Users,
    title: "Everyone is verified",
    description: "Hygglo is safe. Everyone is verified.",
  },
  {
    icon: PiggyBank,
    title: "Cheaper than buying",
    description: "It is often 60% cheaper to rent through Hygglo than a company.",
  },
  {
    icon: MapPin,
    title: "Rent in your area",
    description: "You can usually rent something closer to you than the nearest store.",
  },
  {
    icon: Clock,
    title: "Hours that suit you",
    description: "Before and after work and weekends work best - just as it should be.",
  },
  {
    icon: Leaf,
    title: "Good for the Environment",
    description: "The more things gets used - the better.",
  },
];

// Popular categories
const popularCategories = [
  "Pressure Washer",
  "Carpet & Upholstery Cleaners",
  "Projector",
  "Smoke Machine",
  "Mobile Phones",
  "Rotary Hammer",
  "Power Station",
  "Laptops",
  "Party Lights",
  "Scarifier",
  "Golf Clubs",
  "Drums",
  "Telescopic Ladder",
  "Wet Vacuum Cleaner",
  "Cordless drill",
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Heart
          key={i}
          className={`w-3 h-3 ${i < rating ? "fill-red-500 text-red-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: items, isLoading } = useQuery({
    queryKey: ["items", "featured"],
    queryFn: () => getItems({}),
  });

  const featuredItems = items?.slice(0, 8) || [];

  return (
    <HyggloLayout showSearch searchPlaceholder="Search for what you want to rent">
      {/* Hero Section */}
      <section className="relative group">
        <div className="relative h-[600px] md:h-[700px] overflow-hidden rounded-b-[2.5rem] shadow-2xl mx-4 mb-12">
          {/* Background Image with subtle zoom animation */}
          <div className="absolute inset-0 transition-transform duration-[10000ms] group-hover:scale-110">
            <img
              src="https://images.unsplash.com/photo-1540340061722-9293d5163008?w=1920&h=800&fit=crop"
              alt="Tools and equipment for rent"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Sophisticated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/90 via-[var(--primary)]/60 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Content Wrapper */}
          <div className="absolute inset-0 flex flex-col justify-center">
            <div className="container relative z-10 px-6 lg:px-12">
              <div className="max-w-3xl transform transition-all duration-1000 translate-y-0 opacity-100">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fade-in">
                  <span className="flex w-2 h-2 rounded-full bg-[var(--cta-green)] animate-pulse"></span>
                  <span className="text-sm font-medium text-white tracking-wide">The future of peer-to-peer rentals</span>
                </div>

                {/* Main Headline */}
                <h1
                  className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white leading-[1.1]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Rent exactly what you need, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cta-green)] to-emerald-300">when you need it.</span>
                </h1>
                
                {/* Sub-headline */}
                <p className="text-xl md:text-2xl mb-10 text-white/90 font-light leading-relaxed max-w-2xl">
                  Unlock access to thousands of tools, electronics, and vehicles from trusted people in your neighborhood.
                </p>
                
                {/* Action Area */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Button 
                    className="px-8 py-7 text-lg rounded-full shadow-[0_0_40px_rgba(114,224,155,0.3)] hover:shadow-[0_0_60px_rgba(114,224,155,0.5)] hover:-translate-y-1 transition-all duration-300 font-semibold text-gray-900 border-0" 
                    style={{ backgroundColor: "var(--cta-green)" }} 
                    onClick={() => navigate("/search")}
                  >
                    Start exploring items
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-8 py-7 text-lg rounded-full bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 hover:text-white transition-all duration-300"
                    onClick={() => navigate("/how-it-works")}
                  >
                    How it works
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-12 flex items-center gap-6 text-white/70 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--cta-green)]" />
                    <span>Fully insured rentals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[var(--cta-green)]" />
                    <span>Verified users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Recently active items
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <Card key={i} className="h-64 animate-pulse bg-gray-100" />
                  ))
                ) : (
                  featuredItems.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden card-hover cursor-pointer group"
                      onClick={() => navigate(`/items/${item.id}`)}
                    >
                      <div className="relative">
                        <img
                          src={item.images[0] || "https://via.placeholder.com/300x200"}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <span className="badge-popular">VERY POPULAR</span>
                          <button className="p-1 bg-white/80 rounded hover:bg-white transition-smooth">
                            <Bookmark className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <div className="bg-white/90 rounded-full p-1">
                            <img
                              src={`https://api.dicebear.com/7.x/avatars/svg?seed=${item.owner.id}`}
                              alt={item.owner.name}
                              className="w-6 h-6 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2 mb-2">
                          {item.title}
                        </h3>
                        <RatingStars rating={Math.min(5, Math.floor(item.rating))} />
                        <p className="text-sm font-semibold text-primary mt-2">
                          {formatCurrency(item.pricePerDay)} -{" "}
                          {formatCurrency(Math.round(item.pricePerDay * 2.5))}/day
                        </p>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Categories sidebar */}
            <div className="lg:col-span-1">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Or browse our premier services...
              </h2>
              <div className="flex gap-2 mb-3">
                <button className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium">
                  All categories
                </button>
                <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-smooth">
                  Film & Photography
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => navigate(`/search?category=${encodeURIComponent(category)}`)}
                    className="px-3 py-1.5 rounded-full border border-primary text-primary text-sm hover:bg-primary hover:text-white transition-smooth"
                  >
                    {category}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate("/categories")}
                className="mt-4 px-4 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-smooth"
              >
                Go to category overview →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <h2
            className="text-3xl font-bold text-center mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Some love from our users
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-muted-foreground">{testimonial.time}</span>
                  <RatingStars rating={testimonial.rating} />
                </div>
                <p className="text-sm mb-4 line-clamp-2">{testimonial.comment}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{testimonial.user}</span> rented{" "}
                  <span className="text-primary">{testimonial.item}</span>
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Hygglo - Feature Cards */}
      <section className="py-12 bg-white">
        <div className="container">
          <h2
            className="text-3xl font-bold text-center mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Why choose RentConnect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center card-hover">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3
                  className="font-semibold text-lg mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Feature Icons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {whyChooseHygglo.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="container text-center max-w-3xl">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Powering Global Rentals
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            We want you to focus on your projects. RentConnect's mission is to make it intuitive and robust to rent any item, anywhere, without compromise.
          </p>
          <Button className="btn-cta px-8 py-6 text-lg" onClick={() => navigate("/signup")}>
            Start renting today
          </Button>
        </div>
      </section>
    </HyggloLayout>
  );
}
