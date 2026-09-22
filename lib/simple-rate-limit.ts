const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  options: { maxRequests?: number; windowMs?: number } = {},
) {
  const maxRequests = options.maxRequests ?? MAX_REQUESTS;
  const windowMs = options.windowMs ?? WINDOW_MS;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientKeyFromRequest(request: Request) {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelForwarded) {
    return vercelForwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    return hops.at(-1) ?? "unknown";
  }

  return "unknown";
}
