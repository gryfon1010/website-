import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@server/config/env";

export interface SessionUser {
  id: string;
  role: "OWNER" | "RENTER" | "ADMIN";
}

export function signAccessToken(user: SessionUser) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(user: SessionUser) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL,
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as SessionUser;
}

export async function hashOpaqueToken(token: string) {
  return bcrypt.hash(token, 12);
}

export async function compareOpaqueToken(token: string, hash: string) {
  return bcrypt.compare(token, hash);
}
