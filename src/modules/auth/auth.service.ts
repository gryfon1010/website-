import bcrypt from "bcryptjs";
import { prisma } from "@server/database/prisma";
import { AppError } from "@server/utils/app-error";
import { serializeUser } from "@server/services/serializers";
import {
  compareOpaqueToken,
  hashOpaqueToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@server/services/token.service";

async function persistRefreshToken(userId: string, token: string) {
  const tokenHash = await hashOpaqueToken(token);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function signup(input: { email: string; password: string; name: string; role?: "owner" | "renter" }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new AppError("Email is already registered.", 409);
  }

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      name: input.name,
      role: input.role?.toUpperCase() === "OWNER" ? "OWNER" : "RENTER",
      verificationStatus: "PENDING",
      trustScore: 20,
      location: "London",
    },
  });

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  await persistRefreshToken(user.id, refreshToken);

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: serializeUser(user),
  };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError("Invalid credentials.", 401);
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  await persistRefreshToken(user.id, refreshToken);

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: serializeUser(user),
  };
}

export async function refresh(input: { refreshToken: string }) {
  const payload = verifyRefreshToken(input.refreshToken);
  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.id,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  let matchedToken = null;
  for (const token of tokens) {
    if (await compareOpaqueToken(input.refreshToken, token.tokenHash)) {
      matchedToken = token;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError("Invalid refresh token.", 401);
  }

  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.id } });
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  await persistRefreshToken(user.id, refreshToken);

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: serializeUser(user),
  };
}

export async function logout(input: { refreshToken: string }) {
  const payload = verifyRefreshToken(input.refreshToken);
  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.id,
      revokedAt: null,
    },
  });

  for (const token of tokens) {
    if (await compareOpaqueToken(input.refreshToken, token.tokenHash)) {
      await prisma.refreshToken.update({
        where: { id: token.id },
        data: { revokedAt: new Date() },
      });
      break;
    }
  }
}
