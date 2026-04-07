import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(3).optional().default(""),
  location: z.string().min(2).optional().default(""),
  bio: z.string().max(400).optional().default(""),
  avatar: z.string().url().optional().default(""),
});
