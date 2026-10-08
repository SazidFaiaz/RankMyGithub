const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: Request, key: string, limit: number, windowMs = 60_000): Response | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const id = `${key}:${forwarded}`;
  const now = Date.now();
  const current = requests.get(id);
  if (!current || current.resetAt <= now) {
    if (requests.size >= 5_000) {
      for (const [entryId, entry] of requests) if (entry.resetAt <= now) requests.delete(entryId);
      if (requests.size >= 5_000) {
        const oldest = requests.keys().next().value;
        if (oldest) requests.delete(oldest);
      }
    }
    requests.set(id, { count: 1, resetAt: now + windowMs });
    return null;
  }
  current.count += 1;
  if (current.count <= limit) return null;
  return Response.json(
    { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } },
    { status: 429, headers: { "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)) } },
  );
}