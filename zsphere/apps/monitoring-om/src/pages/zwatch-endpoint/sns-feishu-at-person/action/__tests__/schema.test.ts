import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createUpdateFeiShuAtPersonSchema } from "../schema";

const intl = createMockIntl();

describe("feishu at person action schema", () => {
  it("keeps user id and remark validation", () => {
    const schema = createUpdateFeiShuAtPersonSchema(intl);

    expect(() => schema.parse({ atPersonUserId: "", remark: "" })).toThrow(
      "请填写用户ID",
    );
    expect(() =>
      schema.parse({ atPersonUserId: "a".repeat(65), remark: "" }),
    ).toThrow("输入内容需在 1-64 字符范围内");
    expect(() =>
      schema.parse({ atPersonUserId: "user-id", remark: "a".repeat(65) }),
    ).toThrow("输入内容需在 1-64 字符范围内");
    expect(schema.parse({ atPersonUserId: "user-id", remark: "" })).toEqual({
      atPersonUserId: "user-id",
      remark: "",
    });
  });
});
