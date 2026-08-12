import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createRecoverDbConfirmSchema } from "../schema";

const intl = createMockIntl();

describe("recover db confirm schema", () => {
  it("keeps password required validation", () => {
    const schema = createRecoverDbConfirmSchema(intl);

    expect(() => schema.parse({ password: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ password: "   " })).toThrow("输入内容不能为空");
    expect(schema.parse({ password: "zstack-password" })).toEqual({
      password: "zstack-password",
    });
  });
});
