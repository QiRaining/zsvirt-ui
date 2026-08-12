import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import { createStorageAdapterIdentifierSchema } from "../schema";

const intl = createMockIntl();

describe("storage adapter action schemas", () => {
  it("validates iqn identifier", () => {
    const schema = createStorageAdapterIdentifierSchema(intl, "iSCSI");

    expect(() => schema.parse({ identifier: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ identifier: "x".repeat(224) })).toThrow(
      "输入内容需在1~223字符范围内",
    );
    expect(() => schema.parse({ identifier: "bad" })).toThrow(
      "输入内容只能包含小写字母、数字、连字符",
    );
    expect(
      schema.parse({ identifier: "iqn.2024-12.com.example:disk2" }),
    ).toEqual({
      identifier: "iqn.2024-12.com.example:disk2",
    });
  });

  it("validates nqn identifier", () => {
    const schema = createStorageAdapterIdentifierSchema(intl, "NVMe");

    expect(() =>
      schema.parse({ identifier: "iqn.2024-12.com.example:disk2" }),
    ).toThrow("并遵循格式：nqn");
    expect(
      schema.parse({ identifier: "nqn.2024-12.com.example:disk2" }),
    ).toEqual({
      identifier: "nqn.2024-12.com.example:disk2",
    });
  });
});
