/** Lightweight monitoring helpers — no-op when Sentry is not configured. */

function isSentryEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(
      process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
    )
  );
}

export function captureClientException(error: unknown): void {
  if (!isSentryEnabled()) return;

  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureException(error);
  });
}

export function captureServerException(error: unknown): void {
  if (!isSentryEnabled()) return;

  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureException(error);
  });
}
