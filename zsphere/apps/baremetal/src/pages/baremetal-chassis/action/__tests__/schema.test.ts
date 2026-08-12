import { describe, expect, it } from "vitest";

import {
  createBaremetalChassisUpdateIpmiSchema,
  createBaremetalChassisUpdateSchema,
} from "../schema";

const intl = {
  formatMessage: (
    descriptor: { id: string; defaultMessage: string },
    values?: Record<string, number | string>,
  ) => {
    if (!values) {
      return descriptor.defaultMessage;
    }

    return Object.entries(values).reduce(
      (message, [key, value]) => message.replace(`{${key}}`, String(value)),
      descriptor.defaultMessage,
    );
  },
};

describe("createBaremetalChassisUpdateSchema", () => {
  const schema = createBaremetalChassisUpdateSchema(intl);

  it("accepts valid name and description", () => {
    expect(() =>
      schema.parse({
        name: "baremetal-chassis_01",
        description: "description",
      }),
    ).not.toThrow();
  });

  it("rejects empty or whitespace-only name", () => {
    expect(() =>
      schema.parse({
        name: "   ",
        description: "",
      }),
    ).toThrow("输入内容不能为空");
  });

  it("rejects invalid name characters", () => {
    expect(() =>
      schema.parse({
        name: "invalid/name",
        description: "",
      }),
    ).toThrow("输入内容只能包含中文汉字");
  });

  it("rejects description longer than 256 characters", () => {
    expect(() =>
      schema.parse({
        name: "valid-name",
        description: "a".repeat(257),
      }),
    ).toThrow("输入内容需在1~256字符范围内");
  });
});

describe("createBaremetalChassisUpdateIpmiSchema", () => {
  const schema = createBaremetalChassisUpdateIpmiSchema(intl);

  it("keeps ipmi username and password required validation", () => {
    expect(() =>
      schema.parse({
        ipmiUsername: "",
        ipmiPassword: "password",
      }),
    ).toThrow("请填写用户名");

    expect(() =>
      schema.parse({
        ipmiUsername: "admin",
        ipmiPassword: "",
      }),
    ).toThrow("输入内容不能为空");

    expect(
      schema.parse({
        ipmiUsername: "admin",
        ipmiPassword: "password",
      }),
    ).toEqual({
      ipmiUsername: "admin",
      ipmiPassword: "password",
    });
  });
});
