import { v2 as cloudinary } from "cloudinary";

import type { ProductImage } from "@/types/catalog";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadProductImage(
  file: File,
  options?: { productId?: string; subfolder?: string },
): Promise<ProductImage> {
  const base = process.env.CLOUDINARY_FOLDER ?? "store";
  const segment = options?.subfolder ?? "products";
  const path = options?.productId
    ? `${base}/${segment}/${options.productId}`
    : `${base}/${segment}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: path,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    alt: file.name.replace(/\.[^.]+$/, ""),
  };
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
