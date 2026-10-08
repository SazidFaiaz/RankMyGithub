import { describe, expect, it } from "vitest";
import { calculateScore, gradeFor, levelFor, normalize, normalizeLog } from "./index.js";

describe("normalization", () => {
  it("clamps linear and logarithmic values", () => {
    expect(normalize(-2, 0, 10)).toBe(0);
    expect(normalize(20, 0, 10)).toBe(1);
    expect(normalizeLog(0, 100)).toBe(0);
    expect(normalizeLog(1000, 100)).toBe(1);
  });
});

describe("score labels", () => {
  it("maps the specified grade and level boundaries", () => {
    expect(gradeFor(750)).toBe("B+");
    expect(gradeFor(299)).toBe("E");
    expect(levelFor(950)).toBe("Outstanding Open Source Presence");
    expect(levelFor(500)).toBe("Active Developer");
  });
});

describe("calculateScore", () => {
  it("is deterministic, bounded, and excludes forks and markup languages", () => {
    const profile = {
      followers: 100,
      publicGists: 2,
      createdAt: "2020-01-01T00:00:00.000Z",
      repositories: [
        { stars: 25, forks: 4, hasReadme: true, hasDescription: true, pushedAt: "2026-01-01T00:00:00.000Z", isFork: false, language: "TypeScript" },
        { stars: 200, forks: 80, hasReadme: false, hasDescription: false, pushedAt: null, isFork: true, language: "HTML" },
      ],
      languages: ["TypeScript", "HTML", "Markdown"],
    };
    const now = new Date("2026-10-08T00:00:00.000Z");
    const score = calculateScore(profile, now);
    expect(calculateScore(profile, now)).toEqual(score);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(1000);
    expect(score.categories.map(({ max }) => max)).toEqual([150, 350, 300, 100, 50, 50]);
    expect(score.categories[4]?.score).toBe(8);
  });
});