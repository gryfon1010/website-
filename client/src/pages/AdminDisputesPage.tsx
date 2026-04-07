import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
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
} from "@/components/ui/dialog";
import { api } from "@/services/http";

interface Dispute {
  id: string;
  title: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
  description: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
  item: {
    id: string;
    title: string;
    images: string[];
  };
  openedBy: {
    id: string;
    name: string;
    email: string;
  };
  renter: {
    id: string;
    name: string;
    email: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export function AdminDisputesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | undefined>(undefined);
  const [action, setAction] = useState<"refund_full" | "refund_partial" | "no_refund" | "escalate">("no_refund");
  const queryClient = useQueryClient();

  // Fetch disputes
  const { data: disputesData, isLoading } = useQuery({
    queryKey: ["admin", "disputes", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.append("status", statusFilter);
      const response = await api.get(`/admin/disputes?${params}`);
      return response.data;
    },
  });

  // Resolve dispute mutation
  const resolveMutation = useMutation({
    mutationFn: async (data: { disputeId: string; resolution: string; refundAmount?: number; action: any }) => {
      const response = await api.post(`/admin/disputes/${data.disputeId}/resolve`, {
        resolution: data.resolution,
        refundAmount: data.refundAmount,
        action: data.action,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Dispute resolved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      setSelectedDispute(null);
      setResolution("");
      setRefundAmount(undefined);
      setAction("no_refund");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resolve dispute");
    },
  });

  const handleResolve = () => {
    if (!selectedDispute || !resolution.trim()) return;
    resolveMutation.mutate({
      disputeId: selectedDispute.id,
      resolution,
      refundAmount: action === "refund_partial" ? refundAmount || 0 : undefined,
      action,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Open</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case "RESOLVED":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dispute Resolution</h1>
          <p className="text-muted-foreground">
            Review and resolve user disputes
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <Button onClick={() => setPage(1)}>Apply Filter</Button>
        </div>

        {/* Disputes Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispute</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Opened</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputesData?.data.map((dispute: Dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dispute.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {dispute.description.substring(0, 50)}...
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        By: {dispute.openedBy.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{dispute.item.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-xs text-muted-foreground">Renter: {dispute.renter.email}</div>
                      <div className="text-xs text-muted-foreground">Owner: {dispute.owner.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDispute(dispute)}
                      disabled={dispute.status === "RESOLVED" || dispute.status === "CLOSED"}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
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
            Page {page} of {disputesData?.meta.totalPages || 1}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= (disputesData?.meta.totalPages || 1)}
          >
            Next
          </Button>
        </div>

        {/* Resolution Dialog */}
        {selectedDispute && (
          <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Resolve Dispute</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Dispute Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedDispute.title}</div>
                    <div><strong>Description:</strong> {selectedDispute.description}</div>
                    <div><strong>Item:</strong> {selectedDispute.item.title}</div>
                    <div><strong>Renter:</strong> {selectedDispute.renter.name}</div>
                    <div><strong>Owner:</strong> {selectedDispute.owner.name}</div>
                    <div><strong>Opened by:</strong> {selectedDispute.openedBy.name}</div>
                    <div><strong>Status:</strong> {selectedDispute.status}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Resolution</h4>
                  <Textarea
                    placeholder="Enter your resolution decision..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Refund Action</h4>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="border rounded-md px-3 py-2 text-sm w-full"
                  >
                    <option value="no_refund">No Refund</option>
                    <option value="refund_full">Full Refund</option>
                    <option value="refund_partial">Partial Refund</option>
                    <option value="escalate">Escalate (Further Investigation)</option>
                  </select>
                </div>

                {action === "refund_partial" && (
                  <div>
                    <h4 className="font-semibold mb-2">Refund Amount (£)</h4>
                    <input
                      type="number"
                      value={refundAmount || ""}
                      onChange={(e) => setRefundAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="border rounded-md px-3 py-2 text-sm w-full"
                      placeholder="Enter amount"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleResolve}
                    disabled={!resolution.trim() || resolveMutation.isPending}
                  >
                    Resolve Dispute
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}

export default AdminDisputesPage;
