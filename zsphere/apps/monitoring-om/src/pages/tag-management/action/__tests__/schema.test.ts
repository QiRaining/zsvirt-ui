import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createCreateTagSchema, createUpdateTagSchema } from "../schema";

const intl = createMockIntl();

describe("tag management action schemas", () => {
  it("keeps tag name required and max length validation", () => {
    const schema = createUpdateTagSchema(intl);

    expect(() =>
      schema.parse({ name: "", description: "", color: "#0066ff" }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({ name: "x".repeat(21), description: "", color: "#0066ff" }),
    ).toThrow("长度不能超过20个字符");
    expect(
      schema.parse({ name: "tag-1", description: "", color: "#0066ff" }),
    ).toEqual({
      name: "tag-1",
      description: "",
      color: "#0066ff",
    });
  });

  it("keeps tag description max length validation", () => {
    const schema = createUpdateTagSchema(intl);

    expect(() =>
      schema.parse({
        name: "tag-1",
        description: "x".repeat(257),
        color: "#0066ff",
      }),
    ).toThrow("输入内容需在1~256字符范围内");
  });

  it("keeps create duplicate validation by name and color", () => {
    const schema = createCreateTagSchema(
      intl,
      (name, color) => name === "tag-1" && color === "#0066ff",
    );

    expect(() =>
      schema.parse({ name: "tag-1", description: "", color: "#0066ff" }),
    ).toThrow("已存在相同名称和颜色的标签");
  });
});
