import type { BookingDetails, CreateBookingInput, Review } from "@shared/contracts";
import { api } from "./http";

export async function createBooking(payload: CreateBookingInput) {
  const response = await api.post<BookingDetails>("/bookings", payload);
  return response.data;
}

export async function getMyBookings() {
  const response = await api.get<BookingDetails[]>("/bookings/me");
  return response.data;
}

export async function getOwnerBookings() {
  const response = await api.get<BookingDetails[]>("/bookings/owner");
  return response.data;
}

export async function getBooking(id: string) {
  const response = await api.get<BookingDetails>(`/bookings/${id}`);
  return response.data;
}

export async function createReview(payload: { bookingId: string; rating: number; comment: string }) {
  const response = await api.post<Review>("/reviews", payload);
  return response.data;
}
