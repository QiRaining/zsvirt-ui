import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createSecurityGroupSchema } from "../schema";

const intl = createMockIntl();

describe("security group action schemas", () => {
  it("validates name and description", () => {
    const schema = createSecurityGroupSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "security-group", description: "x".repeat(2001) }),
    ).toThrow("输入内容需在1~2000字符范围内");
    expect(schema.parse({ name: "security-group", description: "" })).toEqual({
      name: "security-group",
      description: "",
    });
  });
});
