import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "@server/middleware/auth";
import { validate } from "@server/middleware/validate";
import { asyncHandler } from "@server/utils/async-handler";
import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  createBooking,
  createReview,
  getBookingById,
  listBookings,
  startBooking,
} from "./bookings.service";
import { createBookingSchema, reviewSchema } from "./bookings.schemas";

export const bookingsRouter = Router();

bookingsRouter.post(
  "/",
  requireAuth,
  validate({ body: createBookingSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.status(201).json(await createBooking(req.auth!.sub, req.body));
  }),
);

bookingsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await listBookings(req.auth!.sub, "renter"));
  }),
);

bookingsRouter.get(
  "/owner",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await listBookings(req.auth!.sub, "owner"));
  }),
);

bookingsRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await getBookingById(req.auth!.sub, req.params.id));
  }),
);

bookingsRouter.post("/:id/confirm", requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await confirmBooking(req.auth!.sub, req.params.id));
}));

bookingsRouter.post("/:id/cancel", requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await cancelBooking(req.auth!.sub, req.params.id));
}));

bookingsRouter.post("/:id/start", requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await startBooking(req.auth!.sub, req.params.id));
}));

bookingsRouter.post("/:id/complete", requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await completeBooking(req.auth!.sub, req.params.id));
}));

bookingsRouter.post(
  "/reviews",
  requireAuth,
  validate({ body: reviewSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.status(201).json(await createReview(req.auth!.sub, req.body));
  }),
);
