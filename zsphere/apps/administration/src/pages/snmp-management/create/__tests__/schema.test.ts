import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import {
  AuthAlgorithmEnum,
  PrivacyAlgorithmEnum,
  VersionType,
} from "../basic-config";
import { createSnmpManagementSchema } from "../schema";

const intl = createMockIntl();

describe("snmp management create schema", () => {
  it("keeps v2c port and read community validations", () => {
    const schema = createSnmpManagementSchema(intl);

    expect(() => schema.parse({ ...v2cValues(), port: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() => schema.parse({ ...v2cValues(), port: 1023 })).toThrow(
      "输入内容需在1024~65565范围内",
    );
    expect(() => schema.parse({ ...v2cValues(), port: "1161.5" })).toThrow(
      "请输入整数",
    );
    expect(() => schema.parse({ ...v2cValues(), readCommunity: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ ...v2cValues(), readCommunity: "invalid space" }),
    ).toThrow("无效的团体字");
  });

  it("keeps v3 username and auth password validations", () => {
    const schema = createSnmpManagementSchema(intl);

    expect(() => schema.parse({ ...v3Values(), userName: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ ...v3Values(), authPassword: "short" }),
    ).toThrow("输入内容需在8~32字符范围内");
    expect(() =>
      schema.parse({ ...v3Values(), confirmAuthPassword: "" }),
    ).toThrow("请填写确认密码");
    expect(() =>
      schema.parse({ ...v3Values(), confirmAuthPassword: "different123" }),
    ).toThrow("输入的两个密码不相同");
  });

  it("keeps privacy password validations when encryption is enabled", () => {
    const schema = createSnmpManagementSchema(intl);

    expect(() =>
      schema.parse({ ...v3Values(), privacyPassword: "short" }),
    ).toThrow("输入内容需在8~32字符范围内");
    expect(() =>
      schema.parse({ ...v3Values(), confirmPrivacyPassword: "" }),
    ).toThrow("请填写确认密码");
    expect(() =>
      schema.parse({
        ...v3Values(),
        confirmPrivacyPassword: "different123",
      }),
    ).toThrow("输入的两个密码不相同");
  });
});

const v2cValues = () => ({
  port: 1161,
  version: VersionType.v2c,
  readCommunity: "public",
  trapList: [],
});

const v3Values = () => ({
  port: 1161,
  version: VersionType.v3,
  userName: "snmp-user",
  authAlgorithmSwitch: true,
  authAlgorithm: AuthAlgorithmEnum.MD5,
  authPassword: "password123",
  confirmAuthPassword: "password123",
  privacyAlgorithmSwitch: true,
  privacyAlgorithm: PrivacyAlgorithmEnum.DES,
  privacyPassword: "privacy123",
  confirmPrivacyPassword: "privacy123",
  trapList: [],
});
