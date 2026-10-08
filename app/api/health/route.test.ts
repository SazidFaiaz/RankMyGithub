import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("health route", () => {
  it("returns the standard success envelope", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: { status: "ok" } });
  });
});