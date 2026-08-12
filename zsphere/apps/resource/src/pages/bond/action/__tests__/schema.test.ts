import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createBondDescriptionSchema,
  createBondPhysicalNetworkTypeSchema,
} from "../schema";

const intl = createMockIntl();

describe("bond action schemas", () => {
  it("validates description length", () => {
    const schema = createBondDescriptionSchema(intl);

    expect(() => schema.parse({ description: "x".repeat(257) })).toThrow(
      "输入内容需在1~256字符范围内",
    );
    expect(schema.parse({ description: "" })).toEqual({
      description: "",
    });
  });

  it("keeps physical network service types as an array", () => {
    const schema = createBondPhysicalNetworkTypeSchema();

    expect(schema.parse({ serviceTypes: ["StorageNetwork"] })).toEqual({
      serviceTypes: ["StorageNetwork"],
    });
  });
});
