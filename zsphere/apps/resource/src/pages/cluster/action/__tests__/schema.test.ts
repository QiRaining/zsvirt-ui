import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createClusterUpdateSchema } from "../schema";

const intl = createMockIntl();

describe("cluster action schemas", () => {
  it("validates update name and description", () => {
    const schema = createClusterUpdateSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "cluster-01", description: "x".repeat(2001) }),
    ).toThrow("输入内容需在1~2000字符范围内");
    expect(schema.parse({ name: "cluster-01", description: "" })).toEqual({
      name: "cluster-01",
      description: "",
    });
  });
});
