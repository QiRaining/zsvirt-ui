import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createUpdateHostGroupSchema } from "../schema";

const intl = createMockIntl();

describe("update host group schema", () => {
  it("validates name and description", () => {
    const schema = createUpdateHostGroupSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "host-group", description: "a".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(schema.parse({ name: "host-group", description: "desc" })).toEqual({
      name: "host-group",
      description: "desc",
    });
    expect(schema.parse({ name: "host/group", description: "" })).toEqual({
      name: "host/group",
      description: "",
    });
  });
});
