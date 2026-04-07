import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HyggloLayout } from "@/components/layout/HyggloLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, Upload, CheckCircle, Clock, XCircle } from "lucide-react";
import { api } from "@/services/http";

interface Dispute {
  id: string;
  bookingId: string;
  itemId: string;
  title: string;
  description: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
  resolution: string;
  evidenceUrls: string[];
  createdAt: string;
  updatedAt: string;
  item?: { id: string; title: string };
  booking?: { id: string; status: string };
  openedBy?: { id: string; name: string; avatar: string };
}

export default function DisputesPage() {
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [newDispute, setNewDispute] = useState({
    bookingId: "",
    title: "",
    description: "",
    evidenceUrls: [] as string[],
  });

  const queryClient = useQueryClient();

  const { data: disputes, isLoading } = useQuery<Dispute[]>({
    queryKey: ["disputes"],
    queryFn: async () => {
      const response = await api.get<Dispute[]>("/disputes");
      return response.data;
    },
  });

  const raiseDisputeMutation = useMutation({
    mutationFn: async (data: typeof newDispute) => {
      const response = await api.post("/disputes", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Dispute raised successfully!");
      setShowRaiseModal(false);
      setNewDispute({ bookingId: "", title: "", description: "", evidenceUrls: [] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to raise dispute.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDispute.bookingId || !newDispute.title || !newDispute.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    raiseDisputeMutation.mutate(newDispute);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-yellow-500 text-white">Open</Badge>;
      case "UNDER_REVIEW":
        return <Badge className="bg-blue-500 text-white">Under Review</Badge>;
      case "RESOLVED":
        return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      case "CLOSED":
        return <Badge className="bg-gray-500 text-white">Closed</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "UNDER_REVIEW":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "RESOLVED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "CLOSED":
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <AppLayout title="Disputes" subtitle="Manage and track your disputes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Your Disputes</h2>
            <p className="text-muted-foreground mt-1">Track and manage dispute resolutions</p>
          </div>
          <Button onClick={() => setShowRaiseModal(true)}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Raise Dispute
          </Button>
        </div>

        {/* Disputes List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </Card>
            ))}
          </div>
        ) : !disputes || disputes.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Disputes Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't raised any disputes. If you have an issue with a booking, you can raise a dispute here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(dispute.status)}
                    <div>
                      <h3 className="font-semibold text-lg">{dispute.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Booking: {dispute.item?.title || dispute.itemId}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(dispute.status)}
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-2">{dispute.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Raised: {new Date(dispute.createdAt).toLocaleDateString()}
                    </span>
                    {dispute.evidenceUrls.length > 0 && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        {dispute.evidenceUrls.length} evidence files
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `/disputes/${dispute.id}`}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Raise Dispute Modal */}
        {showRaiseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Raise a Dispute</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Booking ID</label>
                    <Input
                      value={newDispute.bookingId}
                      onChange={(e) => setNewDispute({ ...newDispute, bookingId: e.target.value })}
                      placeholder="Enter booking ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={newDispute.title}
                      onChange={(e) => setNewDispute({ ...newDispute, title: e.target.value })}
                      placeholder="Brief summary of the issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={newDispute.description}
                      onChange={(e) => setNewDispute({ ...newDispute, description: e.target.value })}
                      placeholder="Describe the issue in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Evidence URLs (optional)</label>
                    <div className="space-y-2">
                      {newDispute.evidenceUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input value={url} readOnly className="flex-1" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newUrls = [...newDispute.evidenceUrls];
                              newUrls.splice(index, 1);
                              setNewDispute({ ...newDispute, evidenceUrls: newUrls });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const url = prompt("Enter evidence image URL:");
                          if (url) {
                            setNewDispute({
                              ...newDispute,
                              evidenceUrls: [...newDispute.evidenceUrls, url],
                            });
                          }
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Evidence URL
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={raiseDisputeMutation.isPending}>
                      {raiseDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRaiseModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
