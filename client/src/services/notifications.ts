import type { Notification } from "@shared/contracts";
import { api } from "./http";

export async function getNotifications() {
  const response = await api.get<Notification[]>("/notifications");
  return response.data;
}

export async function markNotificationRead(id: string) {
  const response = await api.post<Notification>(`/notifications/${id}/read`);
  return response.data;
}
