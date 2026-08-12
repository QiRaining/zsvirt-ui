import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
  isPort: (value: string) => {
    const port = Number(value);
    return Number.isInteger(port) && port >= 1 && port <= 65535;
  },
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createBackupStorageAdvancedSettingSchema,
  createBackupStorageSetMonNodeSchema,
  createBackupStorageUpdateSchema,
  createUpdateBackupStoragePasswordSchema,
} from "../schema";

const intl = createMockIntl();

describe("backup storage action schemas", () => {
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

  it("validates update fields", async () => {
    const schema = createBackupStorageUpdateSchema(intl, "origin-bs");

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        name: "backup-storage",
        description: "x".repeat(2001),
      }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
    await expect(
      schema.parseAsync({ name: "backup-storage", description: "" }),
    ).resolves.toEqual({ name: "backup-storage", description: "" });
  });

  it("rejects duplicated backup storage name", async () => {
    (
      window as typeof window & {
        g_main: { apolloClient: { query: ReturnType<typeof vi.fn> } };
      }
    ).g_main.apolloClient.query = vi.fn().mockResolvedValue({
      data: {
        resourceList: { list: [{ name: "backup-storage" }], total: 1 },
      },
    });
    const schema = createBackupStorageUpdateSchema(intl, "origin-bs");

    await expect(
      schema.parseAsync({ name: "backup-storage", description: "" }),
    ).rejects.toThrow("已存在相同名称的镜像存储");
  });

  it("validates update password fields", () => {
    const schema = createUpdateBackupStoragePasswordSchema(intl);

    expect(() => schema.parse({ password: "", confirmPassword: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ password: "1234567", confirmPassword: "1234567" }),
    ).toThrow("输入内容需在8~32字符范围内");
    expect(() =>
      schema.parse({ password: "12345678", confirmPassword: "87654321" }),
    ).toThrow("两次输入密码不一致，请重新输入一致的密码。");
    expect(
      schema.parse({ password: "12345678", confirmPassword: "12345678" }),
    ).toEqual({ password: "12345678", confirmPassword: "12345678" });
  });

  it("validates advanced setting capacity and concurrency", () => {
    const schema = createBackupStorageAdvancedSettingSchema(intl, 1024 ** 4);

    expect(() =>
      schema.parse({
        reservedCapacity: { number: undefined, unit: "GB" },
        blobUploadConcurrency: "1",
        blobDownloadConcurrency: "1",
      }),
    ).toThrow("不能为空");
    expect(() =>
      schema.parse({
        reservedCapacity: { number: "", unit: "GB" },
        blobUploadConcurrency: "1",
        blobDownloadConcurrency: "1",
      }),
    ).toThrow("不能为空");
    expect(() =>
      schema.parse({
        reservedCapacity: { number: 1, unit: "GB" },
        blobUploadConcurrency: "",
        blobDownloadConcurrency: "1",
      }),
    ).toThrow("不能为空");
    expect(() =>
      schema.parse({
        reservedCapacity: { number: 2, unit: "TB" },
        blobUploadConcurrency: "1",
        blobDownloadConcurrency: "1",
      }),
    ).toThrow("输入内容应该为整数数字，设置数值在[1B, 1TB]之间");
    expect(() =>
      schema.parse({
        reservedCapacity: { number: 1, unit: "GB" },
        blobUploadConcurrency: "17",
        blobDownloadConcurrency: "1",
      }),
    ).toThrow("输入内容应该为整数数字，设置数值范围为[1, 16]");
    expect(
      schema.parse({
        reservedCapacity: { number: 1, unit: "GB" },
        blobUploadConcurrency: "16",
        blobDownloadConcurrency: 1,
      }),
    ).toEqual({
      reservedCapacity: { number: 1, unit: "GB" },
      blobUploadConcurrency: "16",
      blobDownloadConcurrency: 1,
    });
  });

  it("validates backup storage mon node fields", () => {
    const duplicatedSchema = createBackupStorageSetMonNodeSchema(intl, {
      mons: [{ hostname: "192.168.1.1" }],
      requirePassword: true,
    });

    expect(() =>
      duplicatedSchema.parse({
        hostname: "",
        sshPort: "",
        sshUsername: "",
        sshPassword: "",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      duplicatedSchema.parse({
        hostname: "192.168.1.1",
        sshPort: "22",
        sshUsername: "root",
        sshPassword: "password",
      }),
    ).toThrow("监控节点IP已存在");

    const schema = createBackupStorageSetMonNodeSchema(intl, {
      requirePassword: true,
    });

    expect(() =>
      schema.parse({
        hostname: "not-ip",
        sshPort: "22",
        sshUsername: "root",
        sshPassword: "password",
      }),
    ).toThrow("无效的IP地址");
    expect(() =>
      schema.parse({
        hostname: "192.168.1.1",
        sshPort: "not-port",
        sshUsername: "root",
        sshPassword: "password",
      }),
    ).toThrow("无效的SSH端口");
    expect(
      schema.parse({
        hostname: "192.168.1.1",
        sshPort: "22",
        sshUsername: "root",
        sshPassword: "password",
      }),
    ).toEqual({
      hostname: "192.168.1.1",
      sshPort: "22",
      sshUsername: "root",
      sshPassword: "password",
    });
  });

  it("does not require backup storage mon node password when editing", () => {
    const schema = createBackupStorageSetMonNodeSchema(intl, {
      current: { hostname: "192.168.1.1" },
      requirePassword: false,
    });

    expect(
      schema.parse({
        hostname: "192.168.1.1",
        sshPort: 22,
        sshUsername: "root",
        sshPassword: "",
      }),
    ).toEqual({
      hostname: "192.168.1.1",
      sshPort: 22,
      sshUsername: "root",
      sshPassword: "",
    });
  });
});
