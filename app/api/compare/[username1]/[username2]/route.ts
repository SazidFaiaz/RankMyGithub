import { calculateScore } from "@/packages/scoring-engine/src";
import { z } from "zod";
import { errorResponse } from "@/lib/api-response";
import { getAnalyzedProfile, normalizeUsername } from "@/lib/github";
import { rateLimit } from "@/lib/rate-limit";

const paramsSchema = z.object({ username1: z.string().min(1).max(100), username2: z.string().min(1).max(100) });

export async function GET(request: Request, context: { params: Promise<{ username1: string; username2: string }> }) {
  const limited = rateLimit(request, "comparison", 10);
  if (limited) return limited;
  try {
    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) {
      return Response.json({ success: false, error: { code: "INVALID_USERNAME", message: "Enter two valid GitHub usernames." } }, { status: 400 });
    }
    const { username1, username2 } = parsed.data;
    if (normalizeUsername(username1).toLowerCase() === normalizeUsername(username2).toLowerCase()) {
      return Response.json({ success: false, error: { code: "DUPLICATE_COMPARISON", message: "Choose two different GitHub profiles to compare." } }, { status: 400 });
    }
    const [first, second] = await Promise.all([getAnalyzedProfile(username1), getAnalyzedProfile(username2)]);
    return Response.json({
      success: true,
      data: {
        first: { ...first, score: calculateScore(first.metrics) },
        second: { ...second, score: calculateScore(second.metrics) },
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}