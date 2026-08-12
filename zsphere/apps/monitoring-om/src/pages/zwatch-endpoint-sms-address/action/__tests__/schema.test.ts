import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createModifySmsAddressSchema } from "../schema";

const intl = createMockIntl();

describe("zwatch endpoint sms address action schemas", () => {
  it("keeps modify SMS address area code and SMS address validation", () => {
    const schema = createModifySmsAddressSchema(intl);

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
});
