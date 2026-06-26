import { prisma } from "@/lib/prisma";
import { checkRateLimit as checkRateLimitMemory } from "@/lib/simple-rate-limit";

type RateLimitOptions = {
  maxRequests?: number;
  windowMs?: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const DEFAULT_MAX = 20;
const DEFAULT_WINDOW_MS = 60_000;

function databaseStoreEnabled() {
  return process.env.RATE_LIMIT_STORE !== "memory" && Boolean(process.env.DATABASE_URL);
}

export async function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const maxRequests = options.maxRequests ?? DEFAULT_MAX;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;

  if (!databaseStoreEnabled()) {
    return checkRateLimitMemory(key);
  }

  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });

    if (!bucket || bucket.resetAt <= now) {
      await prisma.rateLimitBucket.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (bucket.count >= maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000),
        ),
      };
    }

    await prisma.rateLimitBucket.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return { allowed: true, retryAfterSeconds: 0 };
  } catch (error) {
    console.error("Rate limit DB fallback:", error);
    return checkRateLimitMemory(key);
  }
}

export function getClientKeyFromRequest(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  options?: RateLimitOptions,
): Promise<RateLimitResult & { response?: Response }> {
  const clientKey = getClientKeyFromRequest(request);
  const result = await checkRateLimit(`${scope}:${clientKey}`, options);

  if (!result.allowed) {
    return {
      ...result,
      response: new Response(
        JSON.stringify({ error: "Trop de tentatives. Réessayez dans quelques instants." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.retryAfterSeconds),
          },
        },
      ),
    };
  }

  return result;
}
