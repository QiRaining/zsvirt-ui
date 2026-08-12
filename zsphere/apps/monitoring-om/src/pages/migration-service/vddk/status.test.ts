import { describe, expect, it } from "vitest";

import { getVddkStatus } from "./status";

describe("getVddkStatus", () => {
  it("distinguishes uploaded, missing, and unknown VDDK states", () => {
    expect(getVddkStatus(true)).toEqual({ state: "success", key: "uploaded" });
    expect(getVddkStatus(false)).toEqual({ state: "error", key: "missing" });
    expect(getVddkStatus()).toEqual({
      state: "unknown",
      key: "unknown",
    });
  });
});
