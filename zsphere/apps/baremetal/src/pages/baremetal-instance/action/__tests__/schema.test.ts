import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createBaremetalInstanceUpdateSchema } from "../schema";

const intl = createMockIntl();

describe("createBaremetalInstanceUpdateSchema", () => {
  const schema = createBaremetalInstanceUpdateSchema(intl);

  it("keeps name and description validation", () => {
    expect(() => schema.parse({ name: "   ", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "invalid/name", description: "" }),
    ).toThrow("输入内容只能包含中文汉字");
    expect(() =>
      schema.parse({ name: "a".repeat(129), description: "" }),
    ).toThrow("输入内容需在1~128字符范围内");
    expect(() =>
      schema.parse({ name: "valid-name", description: "a".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(schema.parse({ name: "valid-name", description: "" })).toEqual({
      name: "valid-name",
      description: "",
    });
  });
});
