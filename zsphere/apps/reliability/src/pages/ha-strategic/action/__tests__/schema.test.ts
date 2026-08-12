import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createModifyMigrationStrategySchema } from "../schema";

const intl = createMockIntl();

describe("modify migration strategy schema", () => {
  it("requires host self fencer interval and max attempts", () => {
    const schema = createModifyMigrationStrategySchema(intl);

    expect(() =>
      schema.parse({
        hostBusinessNic: false,
        hostStorageState: false,
        hostBusinessNicHostStorageState: false,
        hostSelfFencerInterval: { number: "", unit: "" },
        hostSelfFencerMaxAttempts: { number: "", unit: "" },
      }),
    ).toThrow("不能为空");
  });

  it("requires non-negative integer values", () => {
    const schema = createModifyMigrationStrategySchema(intl);

    expect(() =>
      schema.parse({
        hostBusinessNic: false,
        hostStorageState: false,
        hostBusinessNicHostStorageState: false,
        hostSelfFencerInterval: { number: "-1", unit: "" },
        hostSelfFencerMaxAttempts: { number: "1.5", unit: "" },
      }),
    ).toThrow("输入内容应该为整数数字，设置数值不得小于0");
  });

  it("accepts migration strategy values", () => {
    const schema = createModifyMigrationStrategySchema(intl);

    expect(
      schema.parse({
        hostBusinessNic: true,
        hostStorageState: false,
        hostBusinessNicHostStorageState: true,
        hostSelfFencerInterval: { number: "5", unit: "" },
        hostSelfFencerMaxAttempts: { number: "6", unit: "" },
      }),
    ).toEqual({
      hostBusinessNic: true,
      hostStorageState: false,
      hostBusinessNicHostStorageState: true,
      hostSelfFencerInterval: { number: "5", unit: "" },
      hostSelfFencerMaxAttempts: { number: "6", unit: "" },
    });
  });
});
