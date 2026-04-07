import { z } from "zod";

export const createDisputeSchema = z.object({
  bookingId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  evidenceUrls: z.array(z.string().url()).default([]),
});

export const updateDisputeSchema = z.object({
  status: z.enum(["open", "under_review", "resolved", "closed"]),
  resolution: z.string().optional(),
});
