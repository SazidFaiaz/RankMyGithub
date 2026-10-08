import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { calculateScore } from "@gitrate/scoring-engine";
import { getAnalyzedProfile, normalizeUsername } from "./services/github.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json({ limit: "32kb" }));

const analysisLimit = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });
const usernameSchema = z.object({ username: z.string().min(1).max(100) });

app.get("/api/health", (_request, response) => {
  response.json({ success: true, data: { status: "ok" } });
});

app.get("/api/analysis/:username", analysisLimit, async (request, response, next) => {
  try {
    const parsed = usernameSchema.safeParse(request.params);
    if (!parsed.success) {
      response.status(400).json({ success: false, error: { code: "INVALID_USERNAME", message: "Enter a valid GitHub username." } });
      return;
    }
    const result = await getAnalyzedProfile(parsed.data.username);
    response.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    response.json({ success: true, data: { ...result, score: calculateScore(result.metrics) } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/compare/:username1/:username2", rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }), async (request, response, next) => {
  try {
    const names = z.object({ username1: z.string().min(1).max(100), username2: z.string().min(1).max(100) }).safeParse(request.params);
    if (!names.success) {
      response.status(400).json({ success: false, error: { code: "INVALID_USERNAME", message: "Enter two valid GitHub usernames." } });
      return;
    }
    if (normalizeUsername(names.data.username1).toLowerCase() === normalizeUsername(names.data.username2).toLowerCase()) {
      response.status(400).json({ success: false, error: { code: "DUPLICATE_COMPARISON", message: "Choose two different GitHub profiles to compare." } });
      return;
    }
    const [first, second] = await Promise.all([
      getAnalyzedProfile(names.data.username1),
      getAnalyzedProfile(names.data.username2),
    ]);
    response.json({
      success: true,
      data: {
        first: { ...first, score: calculateScore(first.metrics) },
        second: { ...second, score: calculateScore(second.metrics) },
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/badge/:username", async (request, response, next) => {
  try {
    const result = await getAnalyzedProfile(request.params.username ?? "");
    const score = calculateScore(result.metrics);
    const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
    const label = "GitRate";
    const value = `${score.total} / 1000 · ${score.grade}`;
    const labelWidth = 55;
    const valueWidth = Math.max(100, value.length * 7 + 20);
    response.setHeader("Cache-Control", "public, max-age=1800, stale-while-revalidate=600");
    response.type("image/svg+xml").send(`<svg xmlns="http://www.w3.org/2000/svg" width="${labelWidth + valueWidth}" height="22" role="img" aria-label="${escapeXml(label)} score ${escapeXml(value)}"><title>${escapeXml(label)} score: ${escapeXml(value)}</title><rect width="${labelWidth}" height="22" rx="4" fill="#263b30"/><rect x="${labelWidth}" width="${valueWidth}" height="22" rx="4" fill="#e9f1eb"/><text x="10" y="15" fill="#fff" font-family="Arial,sans-serif" font-size="11" font-weight="bold">GitRate</text><text x="${labelWidth + 10}" y="15" fill="#263b30" font-family="Arial,sans-serif" font-size="11">${escapeXml(value)}</text></svg>`);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const known = error as { status?: number; code?: string; message?: string };
  const status = known.status ?? 500;
  if (status >= 500) console.error(JSON.stringify({ event: "request_error", code: known.code ?? "INTERNAL_ERROR", status }));
  response.status(status).json({
    success: false,
    error: {
      code: known.code ?? "INTERNAL_ERROR",
      message: known.message ?? "An unexpected error occurred.",
    },
  });
});