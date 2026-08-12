import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createUpdateAccountSchema } from "../schema";

const intl = createMockIntl();

describe("account information schemas", () => {
  it("keeps common name and description validation", () => {
    const schema = createUpdateAccountSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "invalid/name", description: "" }),
    ).toThrow("输入内容只能包含");
    expect(() =>
      schema.parse({ name: "account-name", description: "a".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(
      schema.parse({ name: "account-name", description: "description" }),
    ).toEqual({
      name: "account-name",
      description: "description",
    });
  });
});
