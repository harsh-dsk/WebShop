import { NextResponse } from "next/server";

import { getCurrentUser, isStoreStaff } from "@/lib/auth";
import { uploadProductImage } from "@/lib/cloudinary";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { rateLimitExceededResponse } from "@/lib/rate-limit-response";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`upload:${ip}`, RATE_LIMITS.upload);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit);
  }

  const user = await getCurrentUser();

  if (!user || !isStoreStaff(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const productId = formData.get("productId");
    const folder = formData.get("folder");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 },
      );
    }

    const image = await uploadProductImage(file, {
      productId: typeof productId === "string" ? productId : undefined,
      subfolder: typeof folder === "string" ? folder : undefined,
    });

    return NextResponse.json({ image });
  } catch (error) {
    console.error("[upload] Failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Upload failed. Try again.",
      },
      { status: 500 },
    );
  }
}
