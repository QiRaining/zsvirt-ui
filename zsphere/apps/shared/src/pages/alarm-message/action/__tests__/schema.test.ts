import { describe, expect, it } from "vitest";

import { createHandleAlarmMessageSchema } from "../schema";

const intl = {
  formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
    defaultMessage,
};

describe("handle alarm message schema", () => {
  it("allows preset silence periods without custom time", () => {
    const schema = createHandleAlarmMessageSchema(intl);

    expect(
      schema.parse({
        period: "60",
        customTime: "",
        customTimeUnit: "60",
      }),
    ).toEqual({
      period: "60",
      customTime: "",
      customTimeUnit: "60",
    });
  });

  it("keeps custom time required validation", () => {
    const schema = createHandleAlarmMessageSchema(intl);

    expect(() =>
      schema.parse({
        period: "auto",
        customTime: "",
        customTimeUnit: "60",
      }),
    ).toThrow("输入内容不能为空");
  });

  it("keeps custom time numeric and integer validation", () => {
    const schema = createHandleAlarmMessageSchema(intl);

    expect(() =>
      schema.parse({
        period: "auto",
        customTime: "abc",
        customTimeUnit: "60",
      }),
    ).toThrow("请输入数字");
    expect(() =>
      schema.parse({
        period: "auto",
        customTime: "1.5",
        customTimeUnit: "60",
      }),
    ).toThrow("请输入正整数");
  });

  it("keeps custom time one year max validation", () => {
    const schema = createHandleAlarmMessageSchema(intl);

    expect(() =>
      schema.parse({
        period: "auto",
        customTime: String(365 * 24 + 1),
        customTimeUnit: String(60 * 60),
      }),
    ).toThrow("不能超过一年");
  });
});
