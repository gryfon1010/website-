import { v2 as cloudinary } from "cloudinary";
import { env } from "@server/config/env";
import { AppError } from "@server/utils/app-error";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadBuffer(buffer: Buffer, folder: string, mimetype: string) {
  if (!mimetype.startsWith("image/")) {
    throw new AppError("Only image uploads are allowed.", 400);
  }

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(new AppError("Image upload failed.", 502, error));
          return;
        }
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
}
