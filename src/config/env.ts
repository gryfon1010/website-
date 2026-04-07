import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/rentconnect?schema=public"),
  JWT_ACCESS_SECRET: z.string().min(16).default("development-access-secret-please-change"),
  JWT_REFRESH_SECRET: z.string().min(16).default("development-refresh-secret-please-change"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("30d"),
  STRIPE_SECRET_KEY: z.string().default("sk_test_placeholder"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_placeholder"),
  STRIPE_PUBLISHABLE_KEY: z.string().default("pk_test_placeholder"),
  CLOUDINARY_CLOUD_NAME: z.string().default("demo"),
  CLOUDINARY_API_KEY: z.string().default("demo"),
  CLOUDINARY_API_SECRET: z.string().default("demo"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  QUEUE_ENABLED: z.coerce.boolean().default(false),
  PAYMENT_RELEASE_DELAY_HOURS: z.coerce.number().int().positive().default(24),
  
  // Email Service (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional().default("RentConnect <noreply@rentconnect.app>"),
  
  // SMS Service (Twilio)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

export const env = schema.parse(process.env);
