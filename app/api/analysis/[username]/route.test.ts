import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("analysis route validation", () => {
  it("rejects invalid usernames without contacting GitHub", async () => {
    const response = await GET(new Request("https://gitrate.dev/api/analysis/invalid"), {
      params: Promise.resolve({ username: "not a valid username" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ success: false, error: { code: "INVALID_USERNAME" } });
  });
});