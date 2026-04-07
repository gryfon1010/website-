import { Router } from "express";
import multer from "multer";
import { requireAuth, type AuthenticatedRequest } from "@server/middleware/auth";
import { validate } from "@server/middleware/validate";
import { asyncHandler } from "@server/utils/async-handler";
import { uploadBuffer } from "@server/services/upload.service";
import { updateProfileSchema } from "./users.schemas";
import { createVerificationDocument, getCurrentProfile, updateCurrentProfile } from "./users.service";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const usersRouter = Router();

usersRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await getCurrentProfile(req.auth!.sub));
  }),
);

usersRouter.put(
  "/me",
  requireAuth,
  validate({ body: updateProfileSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await updateCurrentProfile(req.auth!.sub, req.body));
  }),
);

usersRouter.post(
  "/verification-documents",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.file) {
      res.status(400).json({ message: "Verification document is required." });
      return;
    }
    const url = await uploadBuffer(req.file.buffer, "rentconnect/verification", req.file.mimetype);
    await createVerificationDocument({
      userId: req.auth!.sub,
      type: String(req.body.type ?? "ID").toUpperCase() as "ID" | "LICENSE" | "PASSPORT" | "ADDRESS",
      url,
    });
    res.status(201).json({ url });
  }),
);

usersRouter.get(
  "/profile",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await getCurrentProfile(req.auth!.sub));
  }),
);

usersRouter.put(
  "/profile",
  requireAuth,
  validate({ body: updateProfileSchema }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json(await updateCurrentProfile(req.auth!.sub, req.body));
  }),
);
