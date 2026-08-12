import { describe, expect, it } from "vitest";

import {
  createResourceTreeSettingsSchema,
  resourceTreeSettingsDefaultValues,
  toResourceTreeQueryVariables,
  type ResourceTreeSettingsFormValues,
} from "../schema";

describe("resource tree settings schema", () => {
  it("allows only supported arrange keys and directions", () => {
    const schema = createResourceTreeSettingsSchema();

    expect(
      schema.parse({ arrangeKey: "createDate", orderDirection: "asc" }),
    ).toEqual({
      arrangeKey: "createDate",
      orderDirection: "asc",
    });
    expect(
      schema.parse({ arrangeKey: "name", orderDirection: "desc" }),
    ).toEqual({
      arrangeKey: "name",
      orderDirection: "desc",
    });
    expect(() =>
      schema.parse({ arrangeKey: "uuid", orderDirection: "asc" }),
    ).toThrow();
    expect(() =>
      schema.parse({ arrangeKey: "Name", orderDirection: "asc" }),
    ).toThrow();
    expect(() =>
      schema.parse({ arrangeKey: "name", orderDirection: "unknown" }),
    ).toThrow();
  });

  it("defaults arrange key to name ascending", () => {
    expect(resourceTreeSettingsDefaultValues).toEqual({
      arrangeKey: "name",
      orderDirection: "asc",
    });
  });

  it("maps arrange key directly to query order field", () => {
    expect(
      toResourceTreeQueryVariables({
        arrangeKey: "createDate",
        orderDirection: "desc",
      }),
    ).toEqual({
      orderBy: "createDate",
      orderDirection: "desc",
    });
  });

  it("normalizes unsupported persisted query variables", () => {
    expect(
      toResourceTreeQueryVariables({
        arrangeKey: "unsupported",
        orderDirection: "unknown",
      } as unknown as ResourceTreeSettingsFormValues),
    ).toEqual({
      orderBy: "name",
      orderDirection: "asc",
    });
  });
});
