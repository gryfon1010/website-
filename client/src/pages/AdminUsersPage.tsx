import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Star,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/services/http";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  phoneVerified: boolean;
  role: string;
  verificationStatus: string;
  trustScore: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  _count: {
    items: number;
    renterBookings: number;
    ownerBookings: number;
  };
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.append("search", search);
      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    },
  });

  // Suspend user mutation
  const suspendMutation = useMutation({
    mutationFn: async (data: { userId: string; reason: string }) => {
      const response = await api.post(`/admin/users/${data.userId}/suspend`, {
        reason: data.reason,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("User suspended successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSelectedUser(null);
      setSuspendReason("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to suspend user");
    },
  });

  // Verify user mutation
  const verifyMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/admin/users/${userId}/verify`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User verified successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify user");
    },
  });

  const handleSuspend = () => {
    if (!selectedUser || !suspendReason.trim()) return;
    suspendMutation.mutate({ userId: selectedUser.id, reason: suspendReason });
  };

  const handleVerify = (userId: string) => {
    verifyMutation.mutate(userId);
  };

  return (
    <AppLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            View, search, and moderate all users
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setPage(1)}>Search</Button>
        </div>

        {/* Users Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData?.data.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                          {user.phoneVerified && (
                            <Badge variant="secondary" className="ml-1">
                              Verified
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          user.verificationStatus === "VERIFIED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.verificationStatus}
                      </Badge>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{user.trustScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user._count.items} listings</div>
                      <div>{user._count.renterBookings + user._count.ownerBookings} bookings</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.verificationStatus !== "VERIFIED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(user.id)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedUser(user)}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Suspend
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Suspend User</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm">
                              You are about to suspend{" "}
                              <strong>{user.name}</strong> ({user.email})
                            </p>
                            <Textarea
                              placeholder="Enter reason for suspension..."
                              value={suspendReason}
                              onChange={(e) => setSuspendReason(e.target.value)}
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(null);
                                  setSuspendReason("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleSuspend}
                                disabled={!suspendReason.trim() || suspendMutation.isPending}
                              >
                                Confirm Suspension
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {usersData?.meta.totalPages || 1}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= (usersData?.meta.totalPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminUsersPage;
