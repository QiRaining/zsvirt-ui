import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import {
  createEditorSubjectSchema,
  createUpdateSnsTextTemplateSchema,
} from "../schema";

const intl = createMockIntl();

describe("zwatch sns text template action schemas", () => {
  it("keeps message template name and description validation", () => {
    const schema = createUpdateSnsTextTemplateSchema(intl);

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

  it("keeps editor subject required validation for event template", () => {
    const schema = createEditorSubjectSchema(intl, false);

    expect(() => schema.parse({ subject: "", recoverySubject: "" })).toThrow(
      "输入内容不能为空",
    );
    expect(schema.parse({ subject: "alarm", recoverySubject: "" })).toEqual({
      subject: "alarm",
      recoverySubject: "",
    });
  });

  it("keeps recovery subject required validation for alarm template", () => {
    const schema = createEditorSubjectSchema(intl, true);

    expect(() =>
      schema.parse({ subject: "alarm", recoverySubject: "" }),
    ).toThrow("输入内容不能为空");
    expect(
      schema.parse({ subject: "alarm", recoverySubject: "recovered" }),
    ).toEqual({
      subject: "alarm",
      recoverySubject: "recovered",
    });
  });
});
