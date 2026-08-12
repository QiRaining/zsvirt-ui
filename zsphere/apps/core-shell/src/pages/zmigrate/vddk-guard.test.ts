import { describe, expect, it } from "vitest";

import { getVddkGuardState } from "./vddk-guard";

describe("getVddkGuardState", () => {
  it("keeps ZMigration unmounted until VDDK is confirmed available", () => {
    expect(getVddkGuardState({ loading: true })).toBe("loading");
    expect(getVddkGuardState({ error: true, loading: false })).toBe("error");
    expect(getVddkGuardState({ loading: false, uploaded: false })).toBe(
      "missing",
    );
    expect(getVddkGuardState({ loading: false, uploaded: true })).toBe("ready");
    expect(getVddkGuardState({ loading: false })).toBe("error");
  });
});
