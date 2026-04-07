import type { CreateListingInput, ListingSummary, SearchParams } from "@shared/contracts";
import { api } from "./http";

export interface ListingDetails extends ListingSummary {
  owner: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    trustScore: number;
    verificationStatus: "verified" | "pending" | "unverified";
    location: string;
    bio: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
  }>;
}

export async function getItems(params: SearchParams) {
  const response = await api.get<ListingSummary[]>("/items", { params });
  return response.data;
}

export async function getItem(id: string) {
  const response = await api.get<ListingDetails>(`/items/${id}`);
  return response.data;
}

export async function createListing(payload: CreateListingInput) {
  const response = await api.post<ListingSummary>("/items", payload);
  return response.data;
}

export async function updateListing(id: string, payload: CreateListingInput & { isActive?: boolean }) {
  const response = await api.put<ListingSummary>(`/items/${id}`, payload);
  return response.data;
}

export async function deleteListing(id: string) {
  await api.delete(`/items/${id}`);
}

export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await api.post<{ files: Array<{ name: string; url: string }> }>("/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.files;
}
