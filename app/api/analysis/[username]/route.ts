import { z } from "zod";
import { getProfileReport } from "@/lib/analysis";
import { errorResponse } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

const usernameSchema = z.string().min(1).max(100);

export async function GET(request: Request, context: { params: Promise<{ username: string }> }) {
  const limited = rateLimit(request, "analysis", 20);
  if (limited) return limited;
  try {
    const { username } = await context.params;
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      return Response.json({ success: false, error: { code: "INVALID_USERNAME", message: "Enter a valid GitHub username." } }, { status: 400 });
    }
    const data = await getProfileReport(parsed.data);
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch (error) {
    return errorResponse(error);
  }
}