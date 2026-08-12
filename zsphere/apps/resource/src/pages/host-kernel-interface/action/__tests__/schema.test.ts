import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createHostKernelInterfaceUpdateSchema } from "../schema";

const intl = createMockIntl();

describe("host kernel interface action schemas", () => {
  it("validates name and description", () => {
    const schema = createHostKernelInterfaceUpdateSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "kernel-interface", description: "x".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(schema.parse({ name: "kernel-interface", description: "" })).toEqual(
      {
        name: "kernel-interface",
        description: "",
      },
    );
  });
});
