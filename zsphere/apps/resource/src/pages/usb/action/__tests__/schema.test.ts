import { describe, expect, it, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  isIP: (value: string) => value === "192.168.1.1",
}));

import { createMockIntl } from "@zstack/form/testing";

import { createModifyUsbNameSchema } from "../schema";

const intl = createMockIntl();

describe("usb action schemas", () => {
  it("validates usb device name", () => {
    const schema = createModifyUsbNameSchema(intl);

    expect(() => schema.parse({ name: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ name: "bad#" })).toThrow(
      "输入内容只能包含中文汉字",
    );
    expect(schema.parse({ name: "usb-01" })).toEqual({ name: "usb-01" });
  });
});
