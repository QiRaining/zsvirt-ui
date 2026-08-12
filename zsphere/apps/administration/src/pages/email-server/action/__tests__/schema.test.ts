import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import {
  createAddEmailServerSchema,
  createUpdateEmailServerSchema,
} from "../schema";

const intl = createMockIntl();

describe("email server schemas", () => {
  it("keeps add email server validation", () => {
    const schema = createAddEmailServerSchema(intl);

    expect(() =>
      schema.parse({
        name: "email-server",
        description: "",
        username: "",
        password: "",
        smtpServer: "",
        encryptType: "STARTTLS",
        smtpPort: "587",
      }),
    ).toThrow("请输入SMTP服务器");
    expect(() =>
      schema.parse({
        name: "email-server",
        description: "",
        username: "",
        password: "",
        smtpServer: "smtpserver",
        encryptType: "STARTTLS",
        smtpPort: "587",
      }),
    ).toThrow("SMTP服务器格式错误");
    expect(() =>
      schema.parse({
        name: "email-server",
        description: "",
        username: "",
        password: "",
        smtpServer: "smtp.example.com",
        encryptType: "STARTTLS",
        smtpPort: "",
      }),
    ).toThrow("请输入SMTP端口");
    expect(() =>
      schema.parse({
        name: "email-server",
        description: "",
        username: "",
        password: "",
        smtpServer: "smtp.example.com",
        encryptType: "STARTTLS",
        smtpPort: "abc",
      }),
    ).toThrow("SMTP端口格式错误");
    expect(
      schema.parse({
        name: "email-server",
        description: "",
        username: "",
        password: "",
        smtpServer: "smtp.example.com",
        encryptType: "STARTTLS",
        smtpPort: "587",
      }),
    ).toEqual({
      name: "email-server",
      description: "",
      username: "",
      password: "",
      smtpServer: "smtp.example.com",
      encryptType: "STARTTLS",
      smtpPort: "587",
    });
  });

  it("keeps common name and description validation", () => {
    const schema = createUpdateEmailServerSchema(intl);

    expect(() => schema.parse({ name: "", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "invalid/name", description: "" }),
    ).toThrow("输入内容只能包含");
    expect(() =>
      schema.parse({ name: "email-server", description: "a".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(
      schema.parse({ name: "email-server", description: "description" }),
    ).toEqual({
      name: "email-server",
      description: "description",
    });
  });
});
