import { describe, expect, it } from "vitest";

import { createTwoFactorAuthenticationSchema } from "../schema";

const intl = {
  formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
    defaultMessage,
};

describe("two factor authentication schema", () => {
  it("keeps auth code required validation", () => {
    const schema = createTwoFactorAuthenticationSchema(intl);

    expect(() => schema.parse({ username: "admin", authCode: "" })).toThrow(
      "请输入安全码",
    );
  });

  it("keeps six digit auth code validation", () => {
    const schema = createTwoFactorAuthenticationSchema(intl);

    expect(() =>
      schema.parse({ username: "admin", authCode: "abc123" }),
    ).toThrow("安全码应为6位数字");
    expect(schema.parse({ username: "admin", authCode: "123456" })).toEqual({
      username: "admin",
      authCode: "123456",
    });
  });
});
