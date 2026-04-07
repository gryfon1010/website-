import type { NextFunction, Request, Response } from "express";
import { AppError } from "@server/utils/app-error";
import { logger } from "@server/utils/logger";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const normalized = error instanceof AppError ? error : new AppError("Internal server error", 500);

  if (!(error instanceof AppError)) {
    logger.error("Unhandled error", error);
  } else if (normalized.statusCode >= 500) {
    logger.error(normalized.message, normalized);
  } else {
    logger.warn(normalized.message);
  }

  res.status(normalized.statusCode).json({
    message: normalized.message,
    details: normalized.details,
  });
}
