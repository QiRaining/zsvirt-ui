import { describe, expect, it } from "vitest";

import { createBackupPolicyExecutionLogToolbarSchema } from "../schema";

describe("backup policy execution log toolbar schema", () => {
  const schema = createBackupPolicyExecutionLogToolbarSchema();

  it("accepts old duration options only", () => {
    expect(schema.parse({ duration: "3" })).toEqual({ duration: "3" });
    expect(schema.parse({ duration: "7" })).toEqual({ duration: "7" });
    expect(schema.parse({ duration: "30" })).toEqual({ duration: "30" });
    expect(schema.parse({ duration: "-1" })).toEqual({ duration: "-1" });
    expect(() => schema.parse({ duration: "1" })).toThrow();
  });
});
