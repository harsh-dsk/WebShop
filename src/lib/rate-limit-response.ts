import { NextResponse } from "next/server";

import type { RateLimitResult } from "@/lib/rate-limit";

export function rateLimitExceededResponse(
  result: RateLimitResult,
): NextResponse {
  const retryAfterSec = Math.max(
    1,
    Math.ceil((result.retryAfterMs ?? 60_000) / 1000),
  );

  return NextResponse.json(
    {
      error: "Too many requests. Please wait a moment and try again.",
      retryAfter: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}
