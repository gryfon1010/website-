import type { ConversationSummary, Message } from "@shared/contracts";
import { api } from "./http";

export async function getConversations() {
  const response = await api.get<ConversationSummary[]>("/chat/conversations");
  return response.data;
}

export async function createConversation(itemId: string) {
  const response = await api.post<{ id: string }>("/chat/conversations", { itemId });
  return response.data;
}

export async function getMessages(conversationId: string) {
  const response = await api.get<Message[]>(`/chat/conversations/${conversationId}/messages`);
  return response.data;
}

export async function sendMessage(conversationId: string, content: string) {
  const response = await api.post<Message>(`/chat/conversations/${conversationId}/messages`, { content });
  return response.data;
}

export async function markConversationRead(conversationId: string) {
  await api.post(`/chat/conversations/${conversationId}/read`);
}
