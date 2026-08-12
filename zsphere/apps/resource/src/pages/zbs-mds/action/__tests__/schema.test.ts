import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) =>
    /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/.test(
      value,
    ),
}));

import { createMockIntl } from "@zstack/form/testing";

import {
  createAddCbdMdsSchema,
  createModifyCbdMdsSshInfoSchema,
  createModifyCbdMdsSshPasswordSchema,
  createModifyCbdMdsSshPortSchema,
  createModifyCbdMdsSshUsernameSchema,
} from "../schema";

const intl = createMockIntl();

describe("zbs mds action schemas", () => {
  it("validates add mds required fields and ip format", () => {
    const schema = createAddCbdMdsSchema(intl);

    expect(() =>
      schema.parse({
        mdsIp: "",
        sshPort: 22,
        username: "root",
        password: "password",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        mdsIp: "not-ip",
        sshPort: 22,
        username: "root",
        password: "password",
      }),
    ).toThrow("无效的IP地址");
    expect(() =>
      schema.parse({
        mdsIp: "192.168.1.10",
        sshPort: "",
        username: "root",
        password: "password",
      }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        mdsIp: "192.168.1.10",
        sshPort: 22,
        username: "   ",
        password: "password",
      }),
    ).toThrow("输入内容不能为空");
    expect(
      schema.parse({
        mdsIp: "192.168.1.10",
        sshPort: 22,
        username: "root",
        password: "password",
      }),
    ).toEqual({
      mdsIp: "192.168.1.10",
      sshPort: 22,
      username: "root",
      password: "password",
    });
  });

  it("requires ssh username", () => {
    const schema = createModifyCbdMdsSshUsernameSchema(intl);

    expect(() => schema.parse({ sshUsername: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ sshUsername: "   " })).toThrow(
      "输入内容不能为空",
    );
    expect(schema.parse({ sshUsername: "root" })).toEqual({
      sshUsername: "root",
    });
  });

  it("validates ssh port range", () => {
    const schema = createModifyCbdMdsSshPortSchema(intl);

    expect(() => schema.parse({ sshPort: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ sshPort: 70000 })).toThrow(
      "输入内容需在0~65535范围内",
    );
    expect(schema.parse({ sshPort: 22 })).toEqual({ sshPort: 22 });
  });

  it("validates ssh password confirmation", () => {
    const schema = createModifyCbdMdsSshPasswordSchema(intl);

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

  it("validates ssh info required fields", () => {
    const schema = createModifyCbdMdsSshInfoSchema(intl);

    expect(() =>
      schema.parse({ port: "", username: "root", password: "password" }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({ port: 22, username: "   ", password: "password" }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({ port: 22, username: "root", password: "" }),
    ).toThrow("输入内容不能为空");
    expect(
      schema.parse({ port: 22, username: "root", password: "password" }),
    ).toEqual({ port: 22, username: "root", password: "password" });
  });
});
