import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createUpdateThirdPartyAuthSchema } from "../schema";

const intl = createMockIntl();

describe("account third party auth schemas", () => {
  it("keeps common name and description validation", () => {
    const schema = createUpdateThirdPartyAuthSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "invalid/name", description: "" }),
    ).toThrow("输入内容只能包含");
    expect(() =>
      schema.parse({ name: "third-party", description: "a".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(
      schema.parse({ name: "third-party", description: "description" }),
    ).toEqual({
      name: "third-party",
      description: "description",
    });
  });
});
