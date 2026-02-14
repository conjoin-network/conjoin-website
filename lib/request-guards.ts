type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type RateLimitBucket = {
  resetAt: number;
  count: number;
};

const rateLimitStore = new Map<string, RateLimitBucket>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

export function applyRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const current = rateLimitStore.get(input.key);
  if (!current || current.resetAt <= now) {
    const bucket: RateLimitBucket = {
      count: 1,
      resetAt: now + input.windowMs
    };
    rateLimitStore.set(input.key, bucket);
    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(input.windowMs / 1000),
      remaining: Math.max(input.limit - 1, 0)
    };
  }

  current.count += 1;
  rateLimitStore.set(input.key, current);

  const remaining = Math.max(input.limit - current.count, 0);
  const retryAfterSeconds = Math.max(Math.ceil((current.resetAt - now) / 1000), 1);

  return {
    allowed: current.count <= input.limit,
    retryAfterSeconds,
    remaining
  };
}

export function isHoneypotTriggered(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
