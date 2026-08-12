import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import {
  createAddCephPrimaryStoragePoolSchema,
  createUpdateCephPrimaryStoragePoolSchema,
} from "../schema";

const intl = createMockIntl();

describe("createUpdateCephPrimaryStoragePoolSchema", () => {
  it("requires aliasName and keeps non-empty values unchanged", () => {
    const schema = createUpdateCephPrimaryStoragePoolSchema(intl);

    expect(() => schema.parse({ aliasName: "" })).toThrow("输入内容不能为空");
    expect(schema.parse({ aliasName: "pool-alias" })).toEqual({
      aliasName: "pool-alias",
    });
  });
});

describe("createAddCephPrimaryStoragePoolSchema", () => {
  it("requires poolName and allows empty aliasName", () => {
    const schema = createAddCephPrimaryStoragePoolSchema(intl);

    expect(() => schema.parse({ poolName: "", aliasName: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(schema.parse({ poolName: "pool-uuid", aliasName: "" })).toEqual({
      poolName: "pool-uuid",
      aliasName: "",
    });
  });
});
