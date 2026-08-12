import { describe, expect, it } from "vitest";

import {
  createSnapshotCreateSchema,
  createSnapshotUpdateSchema,
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

describe("snapshot action schemas", () => {
  it("keeps create snapshot name, description, and memory validation", () => {
    const schema = createSnapshotCreateSchema(intl);

    expect(() =>
      schema.parse({ name: " ", description: "", withMemory: false }),
    ).toThrow("输入内容不能为空");
    expect(() =>
      schema.parse({
        name: "invalid/name",
        description: "",
        withMemory: false,
      }),
    ).toThrow("输入内容只能包含中文汉字");
    expect(() =>
      schema.parse({
        name: "valid-name",
        description: "a".repeat(2001),
        withMemory: false,
      }),
    ).toThrow("输入内容需在1~2000字符范围内");
    expect(() =>
      schema.parse({
        name: "a".repeat(65),
        description: "",
        withMemory: false,
      }),
    ).toThrow("输入内容需在1~64字符范围内");
    expect(() =>
      schema.parse({ name: "valid-name", description: "", withMemory: "1" }),
    ).toThrow();
    expect(
      schema.parse({
        name: "valid-name",
        description: "",
        withMemory: true,
      }),
    ).toEqual({ name: "valid-name", description: "", withMemory: true });
  });

  it("keeps update snapshot name and description validation", () => {
    const schema = createSnapshotUpdateSchema(intl);

    expect(() => schema.parse({ name: " ", description: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(() =>
      schema.parse({ name: "invalid/name", description: "" }),
    ).toThrow("输入内容只能包含中文汉字");
    expect(() =>
      schema.parse({ name: "valid-name", description: "a".repeat(2001) }),
    ).toThrow("输入内容需在1~2000字符范围内");
    expect(schema.parse({ name: "valid-name", description: "" })).toEqual({
      name: "valid-name",
      description: "",
    });
  });
});
