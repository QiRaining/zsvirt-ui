import { describe, expect, it } from "vitest";

import { createRevertBackupDataSchema } from "../schema";

describe("revert backup data schema", () => {
  it("keeps recoveryStart compatible with the old unchecked initial value", () => {
    const schema = createRevertBackupDataSchema();

    expect(schema.parse({})).toEqual({});
    expect(schema.parse({ recoveryStart: undefined })).toEqual({
      recoveryStart: undefined,
    });
    expect(schema.parse({ recoveryStart: false })).toEqual({
      recoveryStart: false,
    });
    expect(schema.parse({ recoveryStart: true })).toEqual({
      recoveryStart: true,
    });
    expect(schema.safeParse({ recoveryStart: "true" }).success).toBe(false);
  });
});
