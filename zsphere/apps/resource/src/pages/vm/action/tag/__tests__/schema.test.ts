import { describe, expect, it } from "vitest";

import { createManagementTagSchema } from "../schema";

describe("vm management tag schema", () => {
  it("defaults tags to an empty array", () => {
    const schema = createManagementTagSchema();

    expect(schema.parse({})).toEqual({ tags: [] });
  });

  it("accepts selected tag values", () => {
    const schema = createManagementTagSchema();
    const tag = { uuid: "tag-uuid", name: "tag-name" };

    expect(schema.parse({ tags: [tag] })).toEqual({ tags: [tag] });
  });
});
