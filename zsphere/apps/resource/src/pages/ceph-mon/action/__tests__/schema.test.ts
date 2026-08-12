import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) =>
    /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/.test(
      value,
    ),
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createAddCephMonSchema,
  createModifyCephMonPortSchema,
  createModifyCephMonSshPasswordSchema,
  createModifyCephMonSshPortSchema,
  createModifyCephMonSshUsernameSchema,
} from "../schema";

const intl = createMockIntl();

describe("ceph mon action schemas", () => {
  it("requires ssh username", () => {
    const schema = createModifyCephMonSshUsernameSchema(intl);

    expect(() => schema.parse({ sshUsername: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ sshUsername: "   " })).toThrow(
      "输入内容不能为空",
    );
    expect(schema.parse({ sshUsername: "root" })).toEqual({
      sshUsername: "root",
    });
  });

  it("validates add mon required fields and ip format", () => {
    const schema = createAddCephMonSchema(intl);

    expect(() =>
      schema.parse({
        monIp: "",
        sshPort: 22,
        userName: "root",
        passWord: "password",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        monIp: "not-ip",
        sshPort: 22,
        userName: "root",
        passWord: "password",
      }),
    ).toThrow("无效的IP地址");
    expect(() =>
      schema.parse({
        monIp: "192.168.1.10",
        sshPort: "",
        userName: "root",
        passWord: "password",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        monIp: "192.168.1.10",
        sshPort: 22,
        userName: "   ",
        passWord: "password",
      }),
    ).toThrow("输入内容不能为空");
    expect(
      schema.parse({
        monIp: "192.168.1.10",
        sshPort: 22,
        userName: "root",
        passWord: "password",
      }),
    ).toEqual({
      monIp: "192.168.1.10",
      sshPort: 22,
      userName: "root",
      passWord: "password",
    });
  });

  it("validates ssh port range", () => {
    const schema = createModifyCephMonSshPortSchema(intl);

    expect(() => schema.parse({ sshPort: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ sshPort: 70000 })).toThrow(
      "输入内容需在0~65535范围内",
    );
    expect(schema.parse({ sshPort: 22 })).toEqual({ sshPort: 22 });
  });

  it("validates mon port range", () => {
    const schema = createModifyCephMonPortSchema(intl);

    expect(() => schema.parse({ monPort: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ monPort: 70000 })).toThrow(
      "输入内容需在0~65535范围内",
    );
    expect(schema.parse({ monPort: 6789 })).toEqual({ monPort: 6789 });
  });

  it("validates ssh password confirmation", () => {
    const schema = createModifyCephMonSshPasswordSchema(intl);

    expect(() => schema.parse({ password: "", confirmPassword: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ password: "password", confirmPassword: "different" }),
    ).toThrow("两次输入密码不一致，请重新输入一致的密码。");
    expect(
      schema.parse({ password: "password", confirmPassword: "password" }),
    ).toEqual({ password: "password", confirmPassword: "password" });
  });
});
