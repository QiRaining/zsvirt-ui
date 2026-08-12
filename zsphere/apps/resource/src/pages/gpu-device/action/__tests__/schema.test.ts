import { describe, expect, it } from "vitest";

import {
  createGpuDeviceGenerateMdevSchema,
  createGpuDeviceGenerateSriovSchema,
} from "../schema";

describe("gpu device action schemas", () => {
  it("keeps generate mdev spec value optional-compatible", () => {
    const schema = createGpuDeviceGenerateMdevSchema();

    expect(schema.parse({ mdevSpecUuid: "" })).toEqual({
      mdevSpecUuid: "",
    });
    expect(schema.parse({ mdevSpecUuid: "spec-uuid" })).toEqual({
      mdevSpecUuid: "spec-uuid",
    });
  });

  it("validates sriov virtual part number range", () => {
    const schema = createGpuDeviceGenerateSriovSchema(8);

    expect(() => schema.parse({ virtPartNum: "" })).toThrow(
      "输入内容应该为整数数字，设置数值范围为[1, 8]",
    );
    expect(() => schema.parse({ virtPartNum: 0 })).toThrow(
      "输入内容应该为整数数字，设置数值范围为[1, 8]",
    );
    expect(() => schema.parse({ virtPartNum: 9 })).toThrow(
      "输入内容应该为整数数字，设置数值范围为[1, 8]",
    );
    expect(schema.parse({ virtPartNum: 8 })).toEqual({
      virtPartNum: 8,
    });
  });
});
