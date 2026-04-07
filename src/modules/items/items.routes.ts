import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "@server/middleware/auth";
import { validate } from "@server/middleware/validate";
import { asyncHandler } from "@server/utils/async-handler";
import {
  createItem,
  deleteItem,
  getCurrentUserItems,
  getItemAvailability,
  getItemById,
  searchItems,
  updateItem,
} from "./items.service";
import { itemMutationSchema, itemSearchSchema } from "./items.schemas";

export const itemsRouter = Router();

itemsRouter.get(
  "/",
  validate({ query: itemSearchSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(
      await searchItems({
        ...req.query,
        viewerId: req.auth?.sub,
      }),
    );
  }),
);

itemsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await getCurrentUserItems(req.auth!.sub));
  }),
);

itemsRouter.get(
  "/:id",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await getItemById(req.params.id, req.auth?.sub));
  }),
);

itemsRouter.get(
  "/:id/availability",
  asyncHandler(async (req, res) => {
    res.json(await getItemAvailability(req.params.id, String(req.query.startDate ?? ""), String(req.query.endDate ?? "")));
  }),
);

itemsRouter.post(
  "/",
  requireAuth,
  validate({ body: itemMutationSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.status(201).json(await createItem(req.auth!.sub, req.body));
  }),
);

itemsRouter.put(
  "/:id",
  requireAuth,
  validate({ body: itemMutationSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await updateItem(req.auth!.sub, req.params.id, req.body));
  }),
);

itemsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await deleteItem(req.auth!.sub, req.params.id);
    res.status(204).send();
  }),
);
