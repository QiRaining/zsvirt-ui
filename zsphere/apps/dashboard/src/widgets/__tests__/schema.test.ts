import { describe, expect, it } from "vitest";

import { createAddWidgetSchema } from "../schema";

describe("dashboard add widget schema", () => {
  it("keeps widget form payload fields optional like the old form", () => {
    const schema = createAddWidgetSchema();

    expect(schema.parse({})).toEqual({});
    expect(
      schema.parse({
        type: "topMonitor",
        topResource: "vm",
        topMetricName: "cpu",
        limit: 10,
      }),
    ).toEqual({
      type: "topMonitor",
      topResource: "vm",
      topMetricName: "cpu",
      limit: 10,
    });
  });

  it("keeps radio limit compatible with numeric and string values", () => {
    const schema = createAddWidgetSchema();

    expect(schema.parse({ limit: 3 })).toEqual({ limit: 3 });
    expect(schema.parse({ limit: "3" })).toEqual({ limit: "3" });
  });
});
