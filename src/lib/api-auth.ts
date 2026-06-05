import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

/** Returns the authenticated user or a JSON 401 response (never redirects). */
export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    } as const;
  }
  if (user.isBlocked) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Account is blocked" },
        { status: 403 },
      ),
    } as const;
  }
  return { user, response: null } as const;
}
