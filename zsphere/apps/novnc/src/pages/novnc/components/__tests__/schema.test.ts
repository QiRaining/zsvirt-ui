import { describe, expect, it } from "vitest";

import { createNoVncPasteSchema } from "../schema";

const intl = {
  formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
    defaultMessage,
};

describe("novnc paste schema", () => {
  it("keeps paste content required validation", () => {
    const schema = createNoVncPasteSchema(intl);

    expect(() => schema.parse({ text: "" })).toThrow("输入内容不能为空");
    expect(() => schema.parse({ text: "   " })).toThrow("输入内容不能为空");
  });

  it("keeps paste content length limit", () => {
    const schema = createNoVncPasteSchema(intl);

    expect(() => schema.parse({ text: "a".repeat(2001) })).toThrow(
      "最多支持2000个字符",
    );
  });

  it("keeps paste content character validation", () => {
    const schema = createNoVncPasteSchema(intl);

    expect(() => schema.parse({ text: "中文" })).toThrow("无效的命令");
    expect(schema.parse({ text: "echo hello\nls -la" })).toEqual({
      text: "echo hello\nls -la",
    });
  });
});
