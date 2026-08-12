import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) =>
    /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/.test(
      value,
    ),
  isPort: (value: string) => {
    const port = Number(value);
    return Number.isInteger(port) && port >= 1 && port <= 65535;
  },
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createHostPowerControlSchema,
  createModifyHostIpSchema,
  createModifyHostPasswordSchema,
  createModifyHostSshPortSchema,
  createModifyHostUsernameSchema,
  createUpdateHostSchema,
  createUpdateHostIpmiSchema,
  createUpdateHostSshInfoSchema,
} from "../schema";

const intl = createMockIntl();

describe("host action schemas", () => {
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

  it("requires ssh username", () => {
    const schema = createModifyHostUsernameSchema(intl);

    expect(() => schema.parse({ username: "" })).toThrow("输入内容不能为空");
    expect(schema.parse({ username: "root" })).toEqual({ username: "root" });
  });

  it("requires ssh port", () => {
    const schema = createModifyHostSshPortSchema(intl);

    expect(() => schema.parse({ sshPort: "" })).toThrow("请输入端口");
    expect(schema.parse({ sshPort: "22" })).toEqual({ sshPort: "22" });
  });

  it("requires host password", () => {
    const schema = createModifyHostPasswordSchema(intl);

    expect(() => schema.parse({ password: "" })).toThrow("输入内容不能为空");
    expect(schema.parse({ password: "password" })).toEqual({
      password: "password",
    });
  });

  it("keeps host ip required and risk confirmation validation", () => {
    const schema = createModifyHostIpSchema(intl);

    expect(() => schema.parse({ managementIp: "", checked: true })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ managementIp: "192.0.2.10", checked: false }),
    ).toThrow("请先勾选风险提示。");
    expect(
      schema.parse({ managementIp: "192.0.2.10", checked: true }),
    ).toEqual({
      managementIp: "192.0.2.10",
      checked: true,
    });
  });

  it("validates ipmi fields", () => {
    const schema = createUpdateHostIpmiSchema(intl);

    expect(() =>
      schema.parse({
        ipmiAddress: "",
        ipmiPort: "623",
        ipmiUsername: "admin",
        ipmiPassword: "password",
      }),
    ).toThrow("请输入IPMI地址");
    expect(() =>
      schema.parse({
        ipmiAddress: "not-ip",
        ipmiPort: "623",
        ipmiUsername: "admin",
        ipmiPassword: "password",
      }),
    ).toThrow("无效的Ipv4 IP地址");
    expect(() =>
      schema.parse({
        ipmiAddress: "192.168.1.10",
        ipmiPort: "70000",
        ipmiUsername: "admin",
        ipmiPassword: "password",
      }),
    ).toThrow("无效的端口");
    expect(
      schema.parse({
        ipmiAddress: "192.168.1.10",
        ipmiPort: "623",
        ipmiUsername: "admin",
        ipmiPassword: "password",
      }),
    ).toEqual({
      ipmiAddress: "192.168.1.10",
      ipmiPort: "623",
      ipmiUsername: "admin",
      ipmiPassword: "password",
    });
  });

  it("validates update host ssh info fields", () => {
    const schema = createUpdateHostSshInfoSchema(intl);

    expect(() =>
      schema.parse({
        managementIp: "",
        sshPort: "22",
        username: "root",
        password: "password",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        managementIp: "not-ip",
        sshPort: "22",
        username: "root",
        password: "password",
      }),
    ).toThrow("IP格式错误");
    expect(() =>
      schema.parse({
        managementIp: "192.168.1.10",
        sshPort: "70000",
        username: "root",
        password: "password",
      }),
    ).toThrow("SSH端口格式错误");
    expect(
      schema.parse({
        managementIp: "192.168.1.10",
        sshPort: "22",
        username: "root",
        password: "password",
      }),
    ).toEqual({
      managementIp: "192.168.1.10",
      sshPort: "22",
      username: "root",
      password: "password",
    });
  });

  it("validates host power control confirmation text case-insensitively", () => {
    const schema = createHostPowerControlSchema(intl, "Power Off");

    expect(() =>
      schema.parse({
        acceptRisk: "wrong",
        enteringMaintenanceMode: false,
        stopHost: true,
      }),
    ).toThrow("请正确输入风险确认文本");
    expect(
      schema.parse({
        acceptRisk: "power off",
        enteringMaintenanceMode: true,
        stopHost: false,
      }),
    ).toEqual({
      acceptRisk: "power off",
      enteringMaintenanceMode: true,
      stopHost: false,
    });
  });

  it("validates update host fields", async () => {
    const schema = createUpdateHostSchema(intl, "origin-host");

    await expect(
      schema.parseAsync({ name: "", description: "" }),
    ).rejects.toThrow("输入内容不能为空");
    await expect(
      schema.parseAsync({ name: "host-01", description: "x".repeat(2001) }),
    ).rejects.toThrow("输入内容需在1~2000字符范围内");
    await expect(
      schema.parseAsync({ name: "host-01", description: "" }),
    ).resolves.toEqual({ name: "host-01", description: "" });
  });

  it("rejects duplicated host name", async () => {
    (
      window as typeof window & {
        g_main: { apolloClient: { query: ReturnType<typeof vi.fn> } };
      }
    ).g_main.apolloClient.query = vi.fn().mockResolvedValue({
      data: { resourceList: { list: [{ name: "host-01" }], total: 1 } },
    });
    const schema = createUpdateHostSchema(intl, "origin-host");

    await expect(
      schema.parseAsync({ name: "host-01", description: "" }),
    ).rejects.toThrow("已存在相同名称的主机");
  });
});
