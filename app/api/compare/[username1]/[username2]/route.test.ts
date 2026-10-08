import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("comparison route validation", () => {
  it("rejects duplicate profile names without contacting GitHub", async () => {
    const response = await GET(new Request("https://gitrate.dev/api/compare/Octocat/octocat"), {
      params: Promise.resolve({ username1: "Octocat", username2: "octocat" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ success: false, error: { code: "DUPLICATE_COMPARISON" } });
  });
});