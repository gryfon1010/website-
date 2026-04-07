import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { User, UserRecord } from "@shared/contracts";
import { readDb } from "./db";

const JWT_SECRET = process.env.JWT_SECRET ?? "rentconnect-dev-secret";

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

export function toPublicUser(user: UserRecord): User {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;

  if (!token) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = readDb().users.find((entry) => entry.id === payload.sub);
    if (!user) {
      res.status(401).json({ message: "Invalid session." });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Session expired." });
  }
}
