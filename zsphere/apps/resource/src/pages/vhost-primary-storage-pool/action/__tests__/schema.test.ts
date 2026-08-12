import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) =>
    /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/.test(
      value,
    ),
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createAddVhostPrimaryStoragePoolSchema,
  createUpdateVhostPrimaryStoragePoolSchema,
} from "../schema";

const intl = createMockIntl();

describe("createUpdateVhostPrimaryStoragePoolSchema", () => {
  it("requires aliasName and keeps non-empty values unchanged", () => {
    const schema = createUpdateVhostPrimaryStoragePoolSchema(intl);

    expect(() => schema.parse({ aliasName: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ aliasName: "   " })).toThrow(
      "输入内容不能为空",
    );
    expect(schema.parse({ aliasName: "pool-alias" })).toEqual({
      aliasName: "pool-alias",
    });
  });
});

describe("createAddVhostPrimaryStoragePoolSchema", () => {
  it("requires poolName and allows empty aliasName", () => {
    const schema = createAddVhostPrimaryStoragePoolSchema(intl);

    expect(() => schema.parse({ poolName: "", aliasName: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() => schema.parse({ poolName: "   ", aliasName: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(schema.parse({ poolName: "pool-uuid", aliasName: "" })).toEqual({
      poolName: "pool-uuid",
      aliasName: "",
    });
  });
});
