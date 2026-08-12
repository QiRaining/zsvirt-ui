import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isCidr: (value: string) =>
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/.test(
      value,
    ),
  isIP: (value: string) =>
    /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/.test(
      value,
    ),
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createModifyCephTokenSchema,
  createModifyResourceConfigSchema,
  createModifyProvisionSchema,
  createModifyStorageNetworkCidrSchema,
  createPrimaryStorageUpdateSchema,
  createPrimaryStorageSetMdsNodeSchema,
  createPrimaryStorageSetMonNodeSchema,
  createUpdateColdMigrateNetworkSchema,
} from "../schema";

const intl = createMockIntl();

describe("primary storage action schemas", () => {
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

  it("validates required storage network cidr", () => {
    const schema = createModifyStorageNetworkCidrSchema(intl);

    expect(() => schema.parse({ cidr: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ cidr: "not-cidr" })).toThrow("无效的CIDR");
    expect(schema.parse({ cidr: "192.168.1.0/24" })).toEqual({
      cidr: "192.168.1.0/24",
    });
  });

  it("allows blank cold migrate network but validates cidr when present", () => {
    const schema = createUpdateColdMigrateNetworkSchema(intl);

    expect(schema.parse({ coldMigrateNetwork: "" })).toEqual({
      coldMigrateNetwork: "",
    });
    expect(() => schema.parse({ coldMigrateNetwork: "not-cidr" })).toThrow(
      "无效的CIDR",
    );
    expect(schema.parse({ coldMigrateNetwork: "10.0.0.0/24" })).toEqual({
      coldMigrateNetwork: "10.0.0.0/24",
    });
  });

  it("requires provision mode", () => {
    const schema = createModifyProvisionSchema(intl);

    expect(() => schema.parse({ value: "" })).toThrow("输入内容不能为空");
    expect(schema.parse({ value: "ThinProvisioning" })).toEqual({
      value: "ThinProvisioning",
    });
  });

  it("requires 32-character alphanumeric ceph token", () => {
    const schema = createModifyCephTokenSchema(intl);
    const validToken = "a".repeat(32);

    expect(() => schema.parse({ token: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ token: "not-valid" })).toThrow(
      "输入内容只能包含英文字母和数字，且长度为32位",
    );
    expect(schema.parse({ token: validToken })).toEqual({ token: validToken });
  });

  it("validates update fields", async () => {
    const schema = createPrimaryStorageUpdateSchema(intl, "origin-ps");

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({
        name: "primary-storage",
        description: "x".repeat(2001),
      }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
    await expect(
      schema.parseAsync({ name: "primary-storage", description: "" }),
    ).resolves.toEqual({ name: "primary-storage", description: "" });
  });

  it("validates modify resource config over provisioning", () => {
    const schema = createModifyResourceConfigSchema(
      intl,
      "mevoco__dash__overProvisioning__dot__primaryStorage",
    );

    expect(() =>
      schema.parse({
        configs: {
          mevoco__dash__overProvisioning__dot__primaryStorage: "",
        },
      }),
    ).toThrow("不能为空");
    expect(() =>
      schema.parse({
        configs: {
          mevoco__dash__overProvisioning__dot__primaryStorage: "1001",
        },
      }),
    ).toThrow("输入内容应该为数字，设置数值在[1.00, 1000.00]之间");
    expect(
      schema.parse({
        configs: {
          mevoco__dash__overProvisioning__dot__primaryStorage: "1.5",
          sharedblock__dash__qcow2__dot__allocation: "metadata",
        },
      }),
    ).toEqual({
      configs: {
        mevoco__dash__overProvisioning__dot__primaryStorage: "1.5",
        sharedblock__dash__qcow2__dot__allocation: "metadata",
      },
    });
  });

  it("rejects duplicated primary storage name", async () => {
    (
      window as typeof window & {
        g_main: { apolloClient: { query: ReturnType<typeof vi.fn> } };
      }
    ).g_main.apolloClient.query = vi.fn().mockResolvedValue({
      data: { resourceList: { list: [{ name: "primary-storage" }], total: 1 } },
    });
    const schema = createPrimaryStorageUpdateSchema(intl, "origin-ps");

    await expect(
      schema.parseAsync({ name: "primary-storage", description: "" }),
    ).rejects.toThrow("名称不能和已有的重复");
  });

  it("validates primary storage mon node fields", () => {
    const schema = createPrimaryStorageSetMonNodeSchema(
      intl,
      [{ hostname: "192.168.1.1" }],
      undefined,
    );

    expect(() =>
      schema.parse({
        hostname: "",
        sshPort: "",
        sshUsername: "",
        sshPassword: "",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        hostname: "192.168.1.1",
        sshPort: "22",
        sshUsername: "root",
        sshPassword: "password",
      }),
    ).toThrow("监控节点IP已存在");
    expect(() =>
      schema.parse({
        hostname: "not-ip",
        sshPort: "22",
        sshUsername: "root",
        sshPassword: "password",
      }),
    ).toThrow("无效的IP地址");
    expect(
      schema.parse({
        hostname: "192.168.1.2",
        sshPort: "22",
        sshUsername: "root",
        sshPassword: "password",
      }),
    ).toEqual({
      hostname: "192.168.1.2",
      sshPort: "22",
      sshUsername: "root",
      sshPassword: "password",
    });
  });

  it("allows current primary storage mds node hostname but rejects duplicated others", () => {
    const schema = createPrimaryStorageSetMdsNodeSchema(
      intl,
      [{ hostname: "192.168.1.1" }],
      { hostname: "192.168.1.1" },
    );

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

    const duplicatedSchema = createPrimaryStorageSetMdsNodeSchema(
      intl,
      [{ hostname: "192.168.1.2" }],
      { hostname: "192.168.1.1" },
    );

    expect(() =>
      duplicatedSchema.parse({
        hostname: "192.168.1.2",
        sshPort: "22",
        sshUsername: "root",
        sshPassword: "password",
      }),
    ).toThrow("MDS节点IP已存在");
  });
});
