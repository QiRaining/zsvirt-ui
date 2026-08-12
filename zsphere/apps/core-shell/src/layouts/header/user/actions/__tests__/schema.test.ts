import { describe, expect, it, vi } from "vitest";

import { createChangePasswordSchema } from "../schema";

const intl = {
  formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
    defaultMessage,
};

describe("change password schema", () => {
  it("keeps required validation", async () => {
    const schema = createChangePasswordSchema(intl, vi.fn());

    await expect(
      schema.parseAsync({
        oldPassword: "",
        newPassword: "NewPass1!",
        repeatPassword: "NewPass1!",
      }),
    ).rejects.toThrow("输入内容不能为空");
  });

  it("delegates password strategy validation", async () => {
    const schema = createChangePasswordSchema(
      intl,
      vi.fn().mockRejectedValue(new Error("长度为6-18位")),
    );

    await expect(
      schema.parseAsync({
        oldPassword: "old",
        newPassword: "short",
        repeatPassword: "short",
      }),
    ).rejects.toThrow("长度为6-18位");
  });

  it("keeps repeat password equality validation", async () => {
    const schema = createChangePasswordSchema(intl, vi.fn());

    await expect(
      schema.parseAsync({
        oldPassword: "old",
        newPassword: "NewPass1!",
        repeatPassword: "OtherPass1!",
      }),
    ).rejects.toThrow("两次输入的密码不一致");
  });
});
