import { Router } from "express";
import { asyncHandler } from "@server/utils/async-handler";
import { validate } from "@server/middleware/validate";
import { requireAuth, type AuthenticatedRequest } from "@server/middleware/auth";
import { loginSchema, refreshSchema, signupSchema } from "./auth.schemas";
import { login, logout, refresh, signup } from "./auth.service";
import { prisma } from "@server/database/prisma";
import { serializeUser } from "@server/services/serializers";

export const authRouter = Router();

authRouter.post(
  "/signup",
  validate({ body: signupSchema }),
  asyncHandler(async (req, res) => {
    res.status(201).json(await signup(req.body));
  }),
);

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    res.json(await login(req.body));
  }),
);

authRouter.post(
  "/refresh",
  validate({ body: refreshSchema }),
  asyncHandler(async (req, res) => {
    res.json(await refresh(req.body));
  }),
);

authRouter.post(
  "/logout",
  validate({ body: refreshSchema }),
  asyncHandler(async (req, res) => {
    await logout(req.body);
    res.status(204).send();
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.sub },
    });
    res.json(serializeUser(user));
  }),
);
