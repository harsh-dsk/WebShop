import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { rateLimitExceededResponse } from "@/lib/rate-limit-response";
import { profileUpdateSchema } from "@/lib/validations/profile";

export async function PATCH(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`profile:${ip}`, RATE_LIMITS.mutation);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit);
  }

  const { user, response } = await requireApiUser();
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        fullName: data.fullName ?? user.fullName,
        phone: data.phone ?? user.phone,
        address: data.address ?? user.address,
        city: data.city ?? user.city,
        state: data.state ?? user.state,
        postalCode: data.postalCode ?? user.postalCode,
      },
    });

    return NextResponse.json({ ok: true, user: { id: updated.id } });
  } catch {
    return NextResponse.json(
      { error: "Could not update profile. Please try again." },
      { status: 500 },
    );
  }
}
