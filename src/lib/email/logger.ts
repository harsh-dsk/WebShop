type LogContext = Record<string, string | number | boolean | undefined>;

function formatContext(ctx?: LogContext): string {
  if (!ctx) return "";
  const parts = Object.entries(ctx)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${String(v)}`);
  return parts.length ? ` ${parts.join(" ")}` : "";
}

export const emailLogger = {
  info(message: string, ctx?: LogContext) {
    console.info(`[email] ${message}${formatContext(ctx)}`);
  },
  warn(message: string, ctx?: LogContext) {
    console.warn(`[email] ${message}${formatContext(ctx)}`);
  },
  error(message: string, error: unknown, ctx?: LogContext) {
    const detail =
      error instanceof Error ? error.message : String(error);
    console.error(`[email] ${message}${formatContext(ctx)} error=${detail}`);
  },
};
