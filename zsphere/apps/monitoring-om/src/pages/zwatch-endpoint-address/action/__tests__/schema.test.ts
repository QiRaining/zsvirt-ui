import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import {
  createAddEmailAddressSchema,
  createAddSmsAddressSchema,
  createModifyEmailAddressSchema,
} from "../schema";

const intl = createMockIntl();

describe("zwatch endpoint address schemas", () => {
  it("keeps sms address required and phone format validation", () => {
    const schema = createAddSmsAddressSchema(intl);

    expect(() => schema.parse({ smsAddress: "" })).toThrow("请填写手机号码");
    expect(() => schema.parse({ smsAddress: "abc" })).toThrow(
      "手机号码格式不正确",
    );
    expect(schema.parse({ smsAddress: "13800138000" })).toEqual({
      smsAddress: "13800138000",
    });
  });

  it("keeps email address required and email format validation", () => {
    const schema = createModifyEmailAddressSchema(intl);

    expect(() => schema.parse({ emailAddress: "" })).toThrow("请填写邮箱地址");
    expect(() => schema.parse({ emailAddress: "abc" })).toThrow(
      "邮箱地址格式不正确",
    );
    expect(schema.parse({ emailAddress: "test@example.com" })).toEqual({
      emailAddress: "test@example.com",
    });
  });

  it("keeps add email address list required and item format validation", () => {
    const schema = createAddEmailAddressSchema(intl);

    expect(() => schema.parse({ emailAddress: [] })).toThrow("请填写邮箱地址");
    expect(() => schema.parse({ emailAddress: [{ value: "" }] })).toThrow(
      "请填写邮箱地址",
    );
    expect(() => schema.parse({ emailAddress: [{ value: "abc" }] })).toThrow(
      "邮箱地址格式不正确",
    );
    expect(
      schema.parse({
        emailAddress: [
          { value: "test@example.com" },
          { value: "ops@example.com" },
        ],
      }),
    ).toEqual({
      emailAddress: [
        { value: "test@example.com" },
        { value: "ops@example.com" },
      ],
    });
  });
});
