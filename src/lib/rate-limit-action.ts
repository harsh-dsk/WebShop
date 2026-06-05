import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/** Rate-limit server actions. Returns an error message or null if allowed. */
export async function getActionRateLimitError(
  scope: string,
  config = RATE_LIMITS.mutation,
): Promise<string | null> {
  const { userId } = await auth();
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  const key = userId ? `action:user:${userId}:${scope}` : `action:ip:${ip}:${scope}`;
  const result = checkRateLimit(key, config);
  if (!result.success) {
    return "Too many requests. Please wait a moment and try again.";
  }
  return null;
}
