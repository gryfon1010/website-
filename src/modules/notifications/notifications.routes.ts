import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "@server/middleware/auth";
import { asyncHandler } from "@server/utils/async-handler";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@server/services/notification.service";

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await listNotifications(req.auth!.sub));
  }),
);

notificationsRouter.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await markNotificationRead(req.auth!.sub, req.params.id));
  }),
);

notificationsRouter.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await markAllNotificationsRead(req.auth!.sub);
    res.json({ success: true });
  }),
);
