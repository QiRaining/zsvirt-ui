import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createVmSpecNameDescSchema } from "../schema";

const intl = createMockIntl();

describe("vm spec action schemas", () => {
  it("validates name and description", () => {
    const schema = createVmSpecNameDescSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "vm-spec", description: "x".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(schema.parse({ name: "vm-spec", description: "" })).toEqual({
      name: "vm-spec",
      description: "",
    });
  });
});
