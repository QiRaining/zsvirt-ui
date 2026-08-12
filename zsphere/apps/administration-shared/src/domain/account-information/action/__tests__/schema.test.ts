import { describe, expect, it, vi } from "vitest";

import { createModifyAccountPasswordSchema } from "../schema";

const intl = {
  formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
    defaultMessage,
};

describe("account information action schemas", () => {
  it("validates modify account password required fields and confirmation", async () => {
    const schema = createModifyAccountPasswordSchema(intl);

    await expect(
      schema.parseAsync({ password: "", confirm: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({ password: "abc123", confirm: "abc456" }),
    ).rejects.toThrow("两次输入密码不一致，请重新输入一致的密码。");
    await expect(
      schema.parseAsync({ password: "abc123", confirm: "abc123" }),
    ).resolves.toEqual({
      password: "abc123",
      confirm: "abc123",
    });
  });

  it("runs global password validator on password", async () => {
    const validatePassword = vi.fn(async () => {
      throw new Error("密码应包含数字");
    });
    const schema = createModifyAccountPasswordSchema(intl, validatePassword);

    await expect(
      schema.parseAsync({ password: "abcdef", confirm: "abcdef" }),
    ).rejects.toThrow("密码应包含数字");
    expect(validatePassword).toHaveBeenCalledWith(undefined, "abcdef");
  });
});
