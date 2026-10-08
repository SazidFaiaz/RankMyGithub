import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("public API", () => {
  it("returns a standard health response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: { status: "ok" } });
  });

  it("rejects malformed usernames before calling GitHub", async () => {
    const response = await request(app).get("/api/analysis/not%20a%20username");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_USERNAME");
  });

  it("rejects comparisons of the same profile", async () => {
    const response = await request(app).get("/api/compare/Octocat/octocat");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("DUPLICATE_COMPARISON");
  });
});