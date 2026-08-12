import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createUpdateVmSchedulingRuleSchema } from "../schema";

const intl = createMockIntl();

describe("update VM scheduling rule schema", () => {
  it("validates name and description", () => {
    const schema = createUpdateVmSchedulingRuleSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "rule", description: "a".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(schema.parse({ name: "rule", description: "desc" })).toEqual({
      name: "rule",
      description: "desc",
    });
    expect(schema.parse({ name: "rule/zone", description: "" })).toEqual({
      name: "rule/zone",
      description: "",
    });
  });
});
