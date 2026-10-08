import { calculateScore } from "@/packages/scoring-engine/src";
import { getAnalyzedProfile } from "./github";

export async function getProfileReport(username: string) {
  const result = await getAnalyzedProfile(username);
  return { ...result, score: calculateScore(result.metrics) };
}