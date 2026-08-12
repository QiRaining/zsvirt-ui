import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import {
  createDisasterRecoveryStorageNameDescSchema,
  createUpdateDisasterRecoveryStoragePasswordSchema,
} from "../schema";

const intl = createMockIntl();

describe("disaster recovery storage action schemas", () => {
  it("keeps name and long description validation", () => {
    const schema = createDisasterRecoveryStorageNameDescSchema(intl);

    expect(() => schema.parse({ name: "   ", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "invalid/name", description: "" }),
    ).toThrow("输入内容只能包含中文汉字");
    expect(() =>
      schema.parse({ name: "valid-name", description: "a".repeat(2001) }),
    ).toThrow("输入内容需在1~2000字符范围内");
    expect(schema.parse({ name: "valid-name", description: "" })).toEqual({
      name: "valid-name",
      description: "",
    });
  });

  it("keeps password required and confirm password validation", () => {
    const schema = createUpdateDisasterRecoveryStoragePasswordSchema(intl);

    expect(() => schema.parse({ password: "", repeatPassword: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ password: "password-1", repeatPassword: "password-2" }),
    ).toThrow("两次输入的密码不一致");
    expect(
      schema.parse({ password: "password-1", repeatPassword: "password-1" }),
    ).toEqual({
      password: "password-1",
      repeatPassword: "password-1",
    });
  });
});
