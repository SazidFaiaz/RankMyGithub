export function errorResponse(error: unknown): Response {
  const known = error as { status?: number; code?: string; message?: string };
  const status = known.status ?? 500;
  if (status >= 500) console.error(JSON.stringify({ event: "request_error", code: known.code ?? "INTERNAL_ERROR", status }));
  return Response.json({
    success: false,
    error: {
      code: known.code ?? "INTERNAL_ERROR",
      message: status >= 500 && status !== 502 && status !== 503
        ? "An unexpected error occurred."
        : known.message ?? "Invalid request.",
    },
  }, { status });
}