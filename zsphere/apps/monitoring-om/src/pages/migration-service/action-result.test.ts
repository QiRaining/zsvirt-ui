import { describe, expect, it } from "vitest";

import { isSuccessfulActionResult } from "./action-result";

describe("isSuccessfulActionResult", () => {
  it("accepts a fully successful action", () => {
    expect(
      isSuccessfulActionResult({ total: 1, success: 1, fail: 0, exception: 0 }),
    ).toBe(true);
  });

  it.each([
    { total: 1, success: 0, fail: 1, exception: 0 },
    { total: 1, success: 0, fail: 0, exception: 1 },
    { total: 2, success: 1, fail: 0, exception: 0 },
  ])("rejects incomplete or failed completion %#", (result) => {
    expect(isSuccessfulActionResult(result)).toBe(false);
  });
});
