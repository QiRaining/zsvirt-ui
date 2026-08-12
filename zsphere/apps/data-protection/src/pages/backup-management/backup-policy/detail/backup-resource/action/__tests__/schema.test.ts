import { describe, expect, it } from "vitest";

import { createEditBackupPrioritySchema } from "../schema";

describe("edit backup priority schema", () => {
  it("accepts the old normal/high priority values keyed by root volume uuid", () => {
    const schema = createEditBackupPrioritySchema();

    expect(
      schema.parse({
        priorities: {
          "root-volume-1": "normal",
          "root-volume-2": "high",
        },
      }),
    ).toEqual({
      priorities: {
        "root-volume-1": "normal",
        "root-volume-2": "high",
      },
    });
  });

  it("rejects priorities outside the old select options", () => {
    const schema = createEditBackupPrioritySchema();

    expect(() =>
      schema.parse({ priorities: { "root-volume-1": "low" } }),
    ).toThrow("Invalid option");
  });
});
