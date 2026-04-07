import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Package, Calendar, AlertTriangle, DollarSign, TrendingUp, Shield, FileText } from "lucide-react";
import { api } from "@/services/http";

interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  totalBookings: number;
  activeDisputes: number;
  totalRevenue: number;
  pendingPayouts: number;
  platformFee: number;
}

export function AdminDashboard() {
  const [period, setPeriod] = useState("30d");

  // Fetch platform stats
  const { data: stats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await api.get("/admin/stats");
      return response.data;
    },
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin", "analytics", period],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics?period=${period}`);
      return response.data;
    },
  });

  if (statsLoading || analyticsLoading) {
    return (
      <AppLayout>
        <div className="container py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview, moderation tools, and analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Package className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{stats?.totalListings.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats?.totalBookings.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Disputes</p>
                <p className="text-2xl font-bold">{stats?.activeDisputes.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">£{stats?.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
                <p className="text-2xl font-bold">£{stats?.platformFee.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics ({period})</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Users</span>
                <span className="font-medium">{analytics?.metrics.newUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Listings</span>
                <span className="font-medium">{analytics?.metrics.newListings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bookings</span>
                <span className="font-medium">{analytics?.metrics.bookings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">£{analytics?.metrics.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disputes</span>
                <span className="font-medium">{analytics?.metrics.disputes.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {["7d", "30d", "90d"].map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
            <div className="space-y-3">
              {analytics?.categoryBreakdown.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="capitalize">{cat.category.replace(/_/g, " ")}</span>
                  <Badge variant="secondary">{cat._count.id} listings</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="h-auto p-4 justify-start gap-3" asChild>
            <a href="/admin/users">
              <Users className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Manage Users</div>
                <div className="text-xs text-muted-foreground">View, suspend, verify</div>
              </div>
            </a>
          </Button>

          <Button variant="outline" className="h-auto p-4 justify-start gap-3" asChild>
            <a href="/admin/disputes">
              <AlertTriangle className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Moderate Disputes</div>
                <div className="text-xs text-muted-foreground">Resolve conflicts</div>
              </div>
            </a>
          </Button>

          <Button variant="outline" className="h-auto p-4 justify-start gap-3" asChild>
            <a href="/admin/listings">
              <Package className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Review Listings</div>
                <div className="text-xs text-muted-foreground">Approve/remove</div>
              </div>
            </a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;
