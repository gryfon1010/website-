import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { QueryState } from "@/components/shared/QueryState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { deleteListing, updateListing } from "@/services/items";
import { getDashboardSummary } from "@/services/dashboard";
import { getMessages, markConversationRead, sendMessage } from "@/services/chat";
import { markNotificationRead } from "@/services/notifications";
import { createReview } from "@/services/rentals";
import { formatCurrency, formatDate } from "@/lib/format";

function useDashboardTab() {
  const params = new URLSearchParams(window.location.search);
  return params.get("tab") ?? "overview";
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(useDashboardTab);
  const [draftMessage, setDraftMessage] = useState("");

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardSummary,
  });

  const selectedConversationId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("conversationId") ?? dashboardQuery.data?.conversations[0]?.id ?? "";
  }, [dashboardQuery.data?.conversations]);

  const messagesQuery = useQuery({
    queryKey: ["chat", "messages", selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];
      const messages = await getMessages(selectedConversationId);
      await markConversationRead(selectedConversationId);
      return messages;
    },
    enabled: Boolean(selectedConversationId) && selectedConversationId !== "",
  });

  const listingToggleMutation = useMutation({
    mutationFn: ({ id, isActive, payload }: { id: string; isActive: boolean; payload: Parameters<typeof updateListing>[1] }) =>
      updateListing(id, { ...payload, isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  });

  const deleteListingMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) => sendMessage(conversationId, content),
    onSuccess: () => {
      setDraftMessage("");
      toast.success("Message sent!");
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });

  const markNotificationMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => toast.success("Review submitted."),
  });

  const updateUrl = (tab: string, conversationId?: string) => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (conversationId) params.set("conversationId", conversationId);
    window.history.replaceState({}, "", `/dashboard?${params.toString()}`);
    setActiveTab(tab);
  };

  return (
    <AppLayout title="Dashboard" subtitle="Manage listings, bookings, realtime chat, and notifications from live data.">
      <QueryState
        isLoading={dashboardQuery.isLoading}
        isError={dashboardQuery.isError}
        error={dashboardQuery.error}
        onRetry={() => dashboardQuery.refetch()}
        skeletonClassName="h-96 w-full"
      >
        {dashboardQuery.data && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-4">
              {[
                ["Revenue", formatCurrency(dashboardQuery.data.stats.totalEarnings)],
                ["Active listings", String(dashboardQuery.data.stats.activeListings)],
                ["Bookings", String(dashboardQuery.data.stats.totalBookings)],
                ["Unread", String(dashboardQuery.data.stats.unreadMessages)],
              ].map(([label, value]) => (
                <Card key={label} className="p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold mt-2">{value}</p>
                </Card>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={(tab) => updateUrl(tab, selectedConversationId)}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="listings">Listings</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Latest listings</h2>
                  <div className="space-y-3">
                    {dashboardQuery.data.listings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">{listing.location}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(listing.pricePerDay)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Upcoming bookings</h2>
                  <div className="space-y-3">
                    {dashboardQuery.data.bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{booking.item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <span className="text-sm rounded-full bg-primary/10 text-primary px-3 py-1">{booking.status}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="listings" className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => navigate("/listings/new")}>Create listing</Button>
                </div>
                {dashboardQuery.data.listings.map((listing) => (
                  <Card key={listing.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <img src={listing.images[0]} alt={listing.title} className="w-full md:w-32 h-28 object-cover rounded-xl" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{listing.category}</p>
                      <p className="text-xl font-semibold">{listing.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{listing.location}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          listingToggleMutation.mutate({
                            id: listing.id,
                            isActive: !listing.isActive,
                            payload: {
                              title: listing.title,
                              category: listing.category,
                              description: listing.description,
                              pricePerDay: listing.pricePerDay,
                              location: listing.location,
                              images: listing.images,
                              features: listing.features,
                              insuranceEnabled: listing.insuranceEnabled,
                              cancellationPolicy: listing.cancellationPolicy,
                            },
                          })
                        }
                      >
                        {listing.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="destructive" onClick={() => deleteListingMutation.mutate(listing.id)}>
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                {dashboardQuery.data.bookings.map((booking) => (
                  <Card key={booking.id} className="p-5 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{booking.item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">{booking.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{booking.owner.name}</span>
                      <span>{formatCurrency(booking.totalPrice)}</span>
                    </div>
                    {booking.status === "completed" && (
                      <Button onClick={() => reviewMutation.mutate({ bookingId: booking.id, rating: 5, comment: "Great rental experience." })}>
                        Leave 5-star review
                      </Button>
                    )}
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="messages" className="grid lg:grid-cols-[320px_1fr] gap-6">
                <Card className="p-3 space-y-2">
                  {dashboardQuery.data.conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs mt-2">Message an item owner to start a conversation</p>
                    </div>
                  ) : (
                    dashboardQuery.data.conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => updateUrl("messages", conversation.id)}
                        className={`w-full text-left rounded-xl p-3 border ${
                          conversation.id === selectedConversationId ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <p className="font-medium">{conversation.participants[0]?.name ?? "Conversation"}</p>
                        <p className="text-sm text-muted-foreground mt-1">{conversation.lastMessage?.content ?? "No messages yet"}</p>
                      </button>
                    ))
                  )}
                </Card>

                <Card className="p-5 space-y-4">
                  {!selectedConversationId ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg">Select a conversation to start messaging</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[28rem] overflow-auto">
                        {messagesQuery.isLoading && (
                          <div className="text-center py-4 text-sm text-muted-foreground">Loading messages...</div>
                        )}
                        {messagesQuery.isError && (
                          <div className="text-center py-4 text-sm text-red-500">Failed to load messages</div>
                        )}
                        {messagesQuery.data?.map((message) => (
                          <div key={message.id} className="rounded-xl bg-muted p-3">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(message.createdAt)}</p>
                          </div>
                        ))}
                        {messagesQuery.data?.length === 0 && (
                          <div className="text-center py-8 text-sm text-muted-foreground">No messages yet. Start the conversation!</div>
                        )}
                      </div>
                      <form
                        className="space-y-3"
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (draftMessage.trim() && !sendMessageMutation.isPending) {
                            sendMessageMutation.mutate({ conversationId: selectedConversationId, content: draftMessage });
                          }
                        }}
                      >
                        <Textarea 
                          value={draftMessage} 
                          onChange={(event) => setDraftMessage(event.target.value)} 
                          rows={4} 
                          placeholder="Type your message..."
                          disabled={sendMessageMutation.isPending}
                        />
                        <Button 
                          type="submit" 
                          disabled={sendMessageMutation.isPending || !draftMessage.trim()}
                        >
                          {sendMessageMutation.isPending ? "Sending..." : "Send message"}
                        </Button>
                      </form>
                    </>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-3">
                {dashboardQuery.data.notifications.map((notification) => (
                  <Card key={notification.id} className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                    </div>
                    {!notification.read && (
                      <Button variant="outline" onClick={() => markNotificationMutation.mutate(notification.id)}>
                        Mark read
                      </Button>
                    )}
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </QueryState>
    </AppLayout>
  );
}
