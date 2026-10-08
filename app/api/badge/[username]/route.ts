import { calculateScore } from "@gitrate/scoring-engine";
import { errorResponse } from "@/lib/api-response";
import { getAnalyzedProfile } from "@/lib/github";

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character] ?? character);

export async function GET(_request: Request, context: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await context.params;
    const result = await getAnalyzedProfile(username);
    const score = calculateScore(result.metrics);
    const labelWidth = 55;
    const value = `${score.total} / 1000 · ${score.grade}`;
    const valueWidth = Math.max(100, value.length * 7 + 20);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${labelWidth + valueWidth}" height="22" role="img" aria-label="GitRate score ${escapeXml(value)}"><title>GitRate score: ${escapeXml(value)}</title><rect width="${labelWidth}" height="22" rx="4" fill="#263b30"/><rect x="${labelWidth}" width="${valueWidth}" height="22" rx="4" fill="#e9f1eb"/><text x="10" y="15" fill="#fff" font-family="Arial,sans-serif" font-size="11" font-weight="bold">GitRate</text><text x="${labelWidth + 10}" y="15" fill="#263b30" font-family="Arial,sans-serif" font-size="11">${escapeXml(value)}</text></svg>`;
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}