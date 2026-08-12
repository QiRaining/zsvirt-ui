import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createBackupKmsProviderSchema,
  createCreateKmsProviderSchema,
  createUpdateKmsProviderSchema,
} from "../schema";

const intl = createMockIntl();

describe("kms provider action schemas", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      g_main: {
        apolloClient: {
          query: vi.fn().mockResolvedValue({
            data: { resourceList: { list: [], total: 0 } },
          }),
        },
      },
    });
  });

  it("validates backup password fields only for password backup", () => {
    const schema = createBackupKmsProviderSchema(intl);

    expect(
      schema.parse({
        backupMethod: "direct",
        password: "",
        confirmPassword: "",
      }),
    ).toEqual({
      backupMethod: "direct",
      password: "",
      confirmPassword: "",
    });
    expect(() =>
      schema.parse({
        backupMethod: "password",
        password: "",
        confirmPassword: "",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        backupMethod: "password",
        password: "p".repeat(256),
        confirmPassword: "p".repeat(256),
      }),
    ).toThrow("输入内容需在1~255字符范围内");
    expect(() =>
      schema.parse({
        backupMethod: "password",
        password: "secret",
        confirmPassword: "mismatch",
      }),
    ).toThrow("两次输入的密码不一致");
    expect(
      schema.parse({
        backupMethod: "password",
        password: "secret",
        confirmPassword: "secret",
      }),
    ).toEqual({
      backupMethod: "password",
      password: "secret",
      confirmPassword: "secret",
    });
  });

  it("validates create kms provider builtin fields", async () => {
    const schema = createCreateKmsProviderSchema(intl);

    await expect(
      schema.parseAsync({
        name: "",
        description: "",
        type: "NKP",
        endpoint: "",
        port: 5696,
        passwordProtected: false,
        username: "",
        password: "",
      }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        name: "builtin",
        description: "",
        type: "NKP",
        endpoint: "",
        port: "",
        passwordProtected: true,
        username: "",
        password: "",
      }),
    ).resolves.toEqual({
      name: "builtin",
      description: "",
      type: "NKP",
      endpoint: "",
      port: "",
      passwordProtected: true,
      username: "",
      password: "",
    });
  });

  it("validates create kms provider kms-only fields", async () => {
    const schema = createCreateKmsProviderSchema(intl);

    await expect(
      schema.parseAsync({
        name: "external",
        description: "",
        type: "KMS",
        endpoint: "",
        port: 5696,
        passwordProtected: false,
        username: "",
        password: "",
      }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        name: "external",
        description: "",
        type: "KMS",
        endpoint: "kms.example.com",
        port: "",
        passwordProtected: false,
        username: "",
        password: "",
      }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        name: "external",
        description: "",
        type: "KMS",
        endpoint: "kms.example.com",
        port: 5696,
        passwordProtected: true,
        username: "",
        password: "",
      }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        name: "external",
        description: "",
        type: "KMS",
        endpoint: "kms.example.com",
        port: 5696,
        passwordProtected: true,
        username: "admin",
        password: "p".repeat(256),
      }),
    ).rejects.toThrow("输入内容需在1~255字符范围内");
    await expect(
      schema.parseAsync({
        name: "external",
        description: "",
        type: "KMS",
        endpoint: "kms.example.com",
        port: 5696,
        passwordProtected: true,
        username: " admin ",
        password: " secret ",
      }),
    ).resolves.toEqual({
      name: "external",
      description: "",
      type: "KMS",
      endpoint: "kms.example.com",
      port: 5696,
      passwordProtected: true,
      username: "admin",
      password: "secret",
    });
  });

  it("validates kms provider endpoint and port", () => {
    const schema = createUpdateKmsProviderSchema(intl, "KMS");

    expect(() =>
      schema.parse({
        description: "",
        endpoint: "",
        port: 443,
        passwordProtected: false,
        username: "",
        password: "",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        description: "",
        endpoint: "kms.example.com",
        port: "",
        passwordProtected: false,
        username: "",
        password: "",
      }),
    ).toThrow("输入内容不能为空");
    expect(
      schema.parse({
        description: "",
        endpoint: "kms.example.com",
        port: 443,
        passwordProtected: false,
        username: "",
        password: "",
      }),
    ).toEqual({
      description: "",
      endpoint: "kms.example.com",
      port: 443,
      passwordProtected: false,
      username: "",
      password: "",
    });
  });

  it("validates password protected kms provider fields only when enabled", () => {
    const schema = createUpdateKmsProviderSchema(intl, "KMS");

    expect(() =>
      schema.parse({
        description: "",
        endpoint: "kms.example.com",
        port: 443,
        passwordProtected: true,
        username: "",
        password: "",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        description: "",
        endpoint: "kms.example.com",
        port: 443,
        passwordProtected: true,
        username: "u".repeat(256),
        password: "",
      }),
    ).toThrow("输入内容需在1~255字符范围内");
    expect(() =>
      schema.parse({
        description: "",
        endpoint: "kms.example.com",
        port: 443,
        passwordProtected: true,
        username: "admin",
        password: "p".repeat(256),
      }),
    ).toThrow("输入内容需在1~255字符范围内");
    expect(
      schema.parse({
        description: "",
        endpoint: "kms.example.com",
        port: 443,
        passwordProtected: true,
        username: "admin",
        password: "",
      }),
    ).toEqual({
      description: "",
      endpoint: "kms.example.com",
      port: 443,
      passwordProtected: true,
      username: "admin",
      password: "",
    });
  });

  it("does not require kms-only fields for builtin provider", () => {
    const schema = createUpdateKmsProviderSchema(intl, "NKP");

    expect(
      schema.parse({
        description: "builtin",
        endpoint: "",
        port: "",
        passwordProtected: true,
        username: "",
        password: "",
      }),
    ).toEqual({
      description: "builtin",
      endpoint: "",
      port: "",
      passwordProtected: true,
      username: "",
      password: "",
    });
  });
});
