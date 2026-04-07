import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "@server/middleware/auth";
import { asyncHandler } from "@server/utils/async-handler";
import { validate } from "@server/middleware/validate";
import {
  createConversation,
  getConversationMessages,
  listConversations,
  markConversationRead,
  sendConversationMessage,
} from "./chat.service";

const createConversationSchema = z.object({ itemId: z.string().min(1) });
const sendMessageSchema = z.object({ content: z.string().min(1).max(2000) });

export const chatRouter = Router();

chatRouter.get(
  "/conversations",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await listConversations(req.auth!.sub));
  }),
);

chatRouter.post(
  "/conversations",
  requireAuth,
  validate({ body: createConversationSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.status(201).json(await createConversation(req.auth!.sub, req.body.itemId));
  }),
);

chatRouter.get(
  "/conversations/:id/messages",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await getConversationMessages(req.auth!.sub, req.params.id));
  }),
);

chatRouter.post(
  "/conversations/:id/messages",
  requireAuth,
  validate({ body: sendMessageSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.status(201).json(await sendConversationMessage(req.auth!.sub, req.params.id, req.body.content));
  }),
);

chatRouter.post(
  "/conversations/:id/read",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await markConversationRead(req.auth!.sub, req.params.id);
    res.json({ success: true });
  }),
);
