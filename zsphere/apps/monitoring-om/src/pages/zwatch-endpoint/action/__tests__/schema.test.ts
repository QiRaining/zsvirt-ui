import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("@zstack/form", () => ({
  commonNameString: () =>
    z
      .string()
      .refine((value) => value.trim().length > 0, "输入内容不能为空")
      .refine(
        (value) => !value.includes("/"),
        "输入内容只能包含中文汉字、英文字母、数字",
      ),
  commonDescriptionString: () =>
    z.string().max(256, "输入内容需在1~256字符范围内"),
}));

vi.mock("@zstack/zsphere-utils", () => ({
  isPhoneNumber: (value: string) => /^1[3-9]\d{9}$/.test(value),
}));

import {
  createTestMessageSchema,
  createUpdateDingTalkAtPersonSchema,
  getEndpointLocaleLabel,
  getEndpointLocaleOptions,
  createModifyEndpointLocaleSchema,
  createUpdateEndpointSchema,
} from "../schema";

const intl = {
  formatMessage: ({ defaultMessage }: { id: string; defaultMessage: string }) =>
    defaultMessage,
};

describe("zwatch endpoint action schemas", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps endpoint name and description validation", () => {
    const schema = createUpdateEndpointSchema(intl);

    expect(() => schema.parse({ name: "   ", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "invalid/name", description: "" }),
    ).toThrow("输入内容只能包含中文汉字");
    expect(() =>
      schema.parse({ name: "valid-name", description: "a".repeat(257) }),
    ).toThrow("输入内容需在1~256字符范围内");
    expect(schema.parse({ name: "valid-name", description: "" })).toEqual({
      name: "valid-name",
      description: "",
    });
  });

  it("keeps endpoint locale options", () => {
    const schema = createModifyEndpointLocaleSchema();

    expect(schema.parse({ locale: "zh_CN" })).toEqual({ locale: "zh_CN" });
    expect(schema.parse({ locale: "en_US" })).toEqual({ locale: "en_US" });
    expect(schema.safeParse({ locale: "ja_JP" }).success).toBe(false);
  });

  it("accepts only English endpoint locale in English Only mode", () => {
    vi.stubGlobal("__ZSV_ENGLISH_ONLY__", true);

    const schema = createModifyEndpointLocaleSchema();

    expect(schema.safeParse({ locale: "zh_CN" }).success).toBe(false);
    expect(schema.parse({ locale: "en_US" })).toEqual({ locale: "en_US" });
  });

  it("hides Chinese endpoint locale labels in English Only mode", () => {
    vi.stubGlobal("__ZSV_ENGLISH_ONLY__", true);

    expect(getEndpointLocaleOptions(intl)).toEqual([
      { value: "en_US", label: "English" },
    ]);
    expect(getEndpointLocaleLabel(intl, "zh_CN")).toBe("English");
  });

  it("keeps test message area code and SMS address validation", () => {
    const schema = createTestMessageSchema(intl);

    expect(() =>
      schema.parse({ areaCodePhoneNumber: { areaCode: "", phoneNumber: "" } }),
    ).toThrow("请填写国际区号");
    expect(() =>
      schema.parse({
        areaCodePhoneNumber: { areaCode: "086", phoneNumber: "13800138000" },
      }),
    ).toThrow("国际区号不正确");
    expect(() =>
      schema.parse({
        areaCodePhoneNumber: { areaCode: "86", phoneNumber: "" },
      }),
    ).toThrow("请填写短信地址");
    expect(() =>
      schema.parse({
        areaCodePhoneNumber: { areaCode: "86", phoneNumber: "abc" },
      }),
    ).toThrow("短信地址格式不正确");
    expect(
      schema.parse({
        areaCodePhoneNumber: { areaCode: "86", phoneNumber: "13800138000" },
      }),
    ).toEqual({
      areaCodePhoneNumber: { areaCode: "86", phoneNumber: "13800138000" },
    });
  });

  it("keeps DingTalk at-person phone and remark validation", () => {
    const schema = createUpdateDingTalkAtPersonSchema(intl);

    expect(() =>
      schema.parse({
        atPersonPhoneNumber: { areaCode: "", phoneNumber: "" },
        remark: "",
      }),
    ).toThrow("请填写国际区号");
    expect(() =>
      schema.parse({
        atPersonPhoneNumber: { areaCode: "086", phoneNumber: "13800138000" },
        remark: "",
      }),
    ).toThrow("国际区号不正确");
    expect(() =>
      schema.parse({
        atPersonPhoneNumber: { areaCode: "86", phoneNumber: "" },
        remark: "",
      }),
    ).toThrow("请填写手机号");
    expect(() =>
      schema.parse({
        atPersonPhoneNumber: { areaCode: "86", phoneNumber: "abc" },
        remark: "",
      }),
    ).toThrow("手机号格式不正确");
    expect(() =>
      schema.parse({
        atPersonPhoneNumber: { areaCode: "86", phoneNumber: "13800138000" },
        remark: "a".repeat(65),
      }),
    ).toThrow("输入内容需在 1-64 字符范围内");
    expect(
      schema.parse({
        atPersonPhoneNumber: { areaCode: "86", phoneNumber: "13800138000" },
        remark: "",
      }),
    ).toEqual({
      atPersonPhoneNumber: { areaCode: "86", phoneNumber: "13800138000" },
      remark: "",
    });
  });
});
