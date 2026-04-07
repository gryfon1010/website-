import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { getNotifications, markNotificationRead } from "@/services/notifications";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const unreadCount = notificationsQuery.data?.filter((notification) => !notification.read).length ?? 0;

  return (
    <div className="relative">
      <Button type="button" variant="ghost" size="icon" onClick={() => setOpen((current) => !current)}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-white shadow-xl p-3 space-y-2 z-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard?tab=notifications")}>
              View all
            </Button>
          </div>
          <div className="max-h-80 overflow-auto space-y-2">
            {notificationsQuery.data?.length ? (
              notificationsQuery.data.slice(0, 6).map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={async () => {
                    if (!notification.read) {
                      await markReadMutation.mutateAsync(notification.id);
                    }
                    setOpen(false);
                    navigate(notification.href ?? "/dashboard?tab=notifications");
                  }}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    notification.read ? "border-border bg-background" : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.body}</p>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
