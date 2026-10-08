import { getAnalyzedProfile } from "@/lib/github";
import { errorResponse } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request, context: { params: Promise<{ username: string }> }) {
  const limited = rateLimit(request, "github-profile", 20);
  if (limited) return limited;
  try {
    const { username } = await context.params;
    const result = await getAnalyzedProfile(username);
    return Response.json({ success: true, data: result.profile });
  } catch (error) {
    return errorResponse(error);
  }
}