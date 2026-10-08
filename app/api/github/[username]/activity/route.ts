import { getAnalyzedProfile } from "@/lib/github";
import { errorResponse } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request, context: { params: Promise<{ username: string }> }) {
  const limited = rateLimit(request, "github-activity", 20);
  if (limited) return limited;
  try {
    const { username } = await context.params;
    const result = await getAnalyzedProfile(username);
    const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const updatedRepositories = result.repositories
      .filter((repository) => repository.pushedAt && Date.parse(repository.pushedAt) >= cutoff)
      .map(({ name, pushedAt }) => ({ name, pushedAt }));
    return Response.json({
      success: true,
      data: {
        updatedRepositories,
        commits: null,
        activeWeeks: null,
        explanation: "Commit totals and contribution weeks are not available through the public API calls used by GitRate.",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}