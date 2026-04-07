import type { AuthResponse, User } from "@shared/contracts";
import { api } from "./http";

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export async function login(payload: AuthPayload) {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function signup(payload: AuthPayload) {
  const response = await api.post<AuthResponse>("/auth/signup", payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<User>("/auth/me");
  return response.data;
}
