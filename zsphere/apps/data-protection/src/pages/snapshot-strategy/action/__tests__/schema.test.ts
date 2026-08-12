import { describe, expect, it } from "vitest";

import { createSnapshotStrategyNameDescSchema } from "../schema";

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

describe("snapshot strategy action schemas", () => {
  const schema = createSnapshotStrategyNameDescSchema(intl);

  it("keeps name and description validation from NameAndDesc", () => {
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
});
