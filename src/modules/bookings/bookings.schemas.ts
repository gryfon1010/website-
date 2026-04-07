import { z } from "zod";

export const createBookingSchema = z.object({
  itemId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  quantity: z.coerce.number().int().positive().default(1),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3).max(500),
});
