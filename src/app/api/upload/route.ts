import { NextResponse } from "next/server";

import { getCurrentUser, isStoreStaff } from "@/lib/auth";
import { uploadProductImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
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
  } catch (error: any) {
  console.error("UPLOAD ERROR FULL:", error);

  return NextResponse.json(
    {
      error: error?.message || "Upload failed",
      stack: error?.stack,
    },
    { status: 500 }
  );
}
}
