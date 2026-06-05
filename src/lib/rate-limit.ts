export type RateLimitConfig = {
  /** Window size in milliseconds */
  intervalMs: number;
  /** Max requests per window */
  maxRequests: number;
};

export type RateLimitResult = {
  success: boolean;
  retryAfterMs?: number;
};

type Entry = { count: number; resetAt: number };

const globalStore = globalThis as unknown as {
  __rateLimitStore?: Map<string, Entry>;
};

function getStore(): Map<string, Entry> {
  if (!globalStore.__rateLimitStore) {
    globalStore.__rateLimitStore = new Map();
  }
  return globalStore.__rateLimitStore;
}

/** In-memory sliding-window rate limiter (per server instance). */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.intervalMs });
    return { success: true };
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { success: true };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export const RATE_LIMITS = {
  /** Auth pages — generous for legitimate retries */
  auth: { intervalMs: 15 * 60 * 1000, maxRequests: 40 },
  /** Public read APIs */
  publicApi: { intervalMs: 60 * 1000, maxRequests: 120 },
  /** Authenticated mutations (profile, cart actions via API) */
  mutation: { intervalMs: 60 * 1000, maxRequests: 30 },
  /** Upload endpoints — stricter */
  upload: { intervalMs: 60 * 1000, maxRequests: 20 },
  /** Webhooks — high ceiling for provider retries */
  webhook: { intervalMs: 60 * 1000, maxRequests: 200 },
} as const satisfies Record<string, RateLimitConfig>;
