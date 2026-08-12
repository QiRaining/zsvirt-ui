import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createUpdateVmGroupSchema } from "../schema";

const intl = createMockIntl();

describe("update VM group schema", () => {
  it("validates name and description", () => {
    const schema = createUpdateVmGroupSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "vm-group", description: "a".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(schema.parse({ name: "vm-group", description: "desc" })).toEqual({
      name: "vm-group",
      description: "desc",
    });
    expect(schema.parse({ name: "vm/group", description: "" })).toEqual({
      name: "vm/group",
      description: "",
    });
  });
});
