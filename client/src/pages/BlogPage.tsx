import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";

const blogPosts = [
  {
    title: "The Rise of the Sharing Economy",
    excerpt: "How peer-to-peer rentals are changing the way we think about ownership...",
    date: "March 25, 2026",
    category: "Trends"
  },
  {
    title: "10 Items You Should Rent Instead of Buy",
    excerpt: "Save money and reduce waste by renting these commonly purchased items...",
    date: "March 20, 2026",
    category: "Tips"
  },
  {
    title: "How to Price Your Rental Items for Maximum Earnings",
    excerpt: "Learn the secrets to dynamic pricing and optimizing your rental income...",
    date: "March 15, 2026",
    category: "Owner Tips"
  },
  {
    title: "Building Trust in Peer-to-Peer Rentals",
    excerpt: "Understanding trust scores, verification, and building your reputation...",
    date: "March 10, 2026",
    category: "Safety"
  },
  {
    title: "Sustainable Living Through Renting",
    excerpt: "How the sharing economy is helping reduce environmental impact...",
    date: "March 5, 2026",
    category: "Sustainability"
  },
  {
    title: "Top 10 Most Rented Items This Month",
    excerpt: "See what's trending on RentConnect and why these items are so popular...",
    date: "March 1, 2026",
    category: "Trends"
  }
];

export function BlogPage() {
  return (
    <AppLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-4">RentConnect Blog</h1>
        <p className="text-xl text-muted-foreground mb-12">
          News, tips, and insights from the sharing economy
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-xs text-primary font-semibold mb-2">{post.category}</div>
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>
              <div className="text-sm text-muted-foreground">{post.date}</div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default BlogPage;
