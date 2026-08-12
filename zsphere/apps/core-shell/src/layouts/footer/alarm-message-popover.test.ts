import { describe, expect, it } from "vitest";

import { createAlarmFilterParams } from "./alarm-message-popover";

describe("createAlarmFilterParams", () => {
  it("clears the default emergency level filter for All", () => {
    expect(createAlarmFilterParams("All")).toEqual({ emergencyLevel: [] });
  });

  it("uses the provided filter key for third-party alarm filters", () => {
    expect(createAlarmFilterParams("Emergent", "alertLevel")).toEqual({
      alertLevel: ["Emergent"],
    });
  });
});
