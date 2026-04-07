import { Router } from "express";
import multer from "multer";
import { requireAuth } from "@server/middleware/auth";
import { asyncHandler } from "@server/utils/async-handler";
import { uploadBuffer } from "@server/services/upload.service";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadsRouter = Router();

uploadsRouter.post(
  "/",
  requireAuth,
  upload.array("files", 10),
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const uploaded = await Promise.all(
      files.map(async (file) => ({
        name: file.originalname,
        url: await uploadBuffer(file.buffer, "rentconnect/listings", file.mimetype),
      })),
    );
    res.status(201).json({ files: uploaded });
  }),
);
