import { z } from "zod";

export const itemSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const itemMutationSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  description: z.string().min(10),
  pricePerDay: z.coerce.number().int().positive(),
  location: z.string().min(2),
  images: z.array(z.string().url()).min(1),
  features: z.array(z.string()).default([]),
  insuranceEnabled: z.boolean(),
  cancellationPolicy: z.string().min(6),
  isActive: z.boolean().optional(),
});
