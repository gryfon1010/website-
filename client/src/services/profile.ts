import type { UpdateProfileInput, User } from "@shared/contracts";
import { api } from "./http";

export async function getProfile() {
  const response = await api.get<User>("/profile");
  return response.data;
}

export async function updateProfile(payload: UpdateProfileInput) {
  const response = await api.put<User>("/profile", payload);
  return response.data;
}
