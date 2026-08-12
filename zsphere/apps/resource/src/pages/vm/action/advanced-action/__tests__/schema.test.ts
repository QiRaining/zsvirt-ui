import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createChangeVmPasswordSchema,
  createEditGuesttoolsConfigSchema,
  createSetSshKeySchema,
} from "../schema";

const intl = createMockIntl();

describe("vm advanced action schemas", () => {
  it("requires ssh key", () => {
    const schema = createSetSshKeySchema(intl);

    expect(() => schema.parse({ sshkey: "" })).toThrow("请填写SSH KEY");
    expect(schema.parse({ sshkey: "ssh-rsa AAA" })).toEqual({
      sshkey: "ssh-rsa AAA",
    });
  });

  it("accepts guesttools config values", () => {
    const schema = createEditGuesttoolsConfigSchema();

    expect(
      schema.parse({
        crashStrategy: "Reboot",
        timeSync: true,
      }),
    ).toEqual({
      crashStrategy: "Reboot",
      timeSync: true,
    });
  });

  it("validates change vm password fields and confirmation", async () => {
    const schema = createChangeVmPasswordSchema(intl);

    await expect(
      schema.parseAsync({
        accountNameMethods: "custom",
        account: "",
        password: "",
        confirmPassword: "",
      }),
    ).rejects.toThrow("请输入用户名");
    await expect(
      schema.parseAsync({
        accountNameMethods: "system",
        account: "root",
        password: "x".repeat(33),
        confirmPassword: "x".repeat(33),
      }),
    ).rejects.toThrow("密码长度不能超过32位");
    await expect(
      schema.parseAsync({
        accountNameMethods: "system",
        account: "root",
        password: "abc123",
        confirmPassword: "abc456",
      }),
    ).rejects.toThrow("输入的两个密码不相同");
    await expect(
      schema.parseAsync({
        accountNameMethods: "system",
        account: "root",
        password: "abc123",
        confirmPassword: "abc123",
      }),
    ).resolves.toEqual({
      accountNameMethods: "system",
      account: "root",
      password: "abc123",
      confirmPassword: "abc123",
    });
  });

  it("runs change vm password validators", async () => {
    const validateCommonPassword = vi.fn(async () => {
      throw new Error("common password error");
    });
    const validateGlobalPassword = vi.fn(async () => {
      throw new Error("global password error");
    });
    const schema = createChangeVmPasswordSchema(
      intl,
      validateCommonPassword,
      validateGlobalPassword,
    );

    await expect(
      schema.parseAsync({
        accountNameMethods: "system",
        account: "root",
        password: "abc123",
        confirmPassword: "abc123",
      }),
    ).rejects.toThrow("common password error");
    expect(validateCommonPassword).toHaveBeenCalledWith("abc123");
    expect(validateGlobalPassword).toHaveBeenCalledWith("abc123");
  });
});
