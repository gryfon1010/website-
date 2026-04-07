import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@server/database/prisma";
import { env } from "@server/config/env";
import { AppError } from "@server/utils/app-error";

interface AccessTokenPayload {
  sub: string;
  role: "OWNER" | "RENTER" | "ADMIN";
}

export interface AuthenticatedRequest extends Request {
  auth?: AccessTokenPayload;
}

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    if (!token) {
      throw new AppError("Authentication required.", 401);
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("Invalid session.", 401);
    }

    req.auth = payload;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Invalid or expired token.", 401));
  }
}

export function requireRole(...roles: Array<"OWNER" | "RENTER" | "ADMIN">) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      next(new AppError("Forbidden.", 403));
      return;
    }
    next();
  };
}
