import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { corsOptions } from "@server/config/cors";
import { env } from "@server/config/env";
import { errorHandler } from "@server/middleware/error-handler";
import { notFoundHandler } from "@server/middleware/not-found";
import { logger } from "@server/utils/logger";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: env.NODE_ENV === "production" ? 150 : 1000,
      standardHeaders: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", environment: env.NODE_ENV });
  });

  app.use(errorHandler);
  app.use(notFoundHandler);

  return app;
}
