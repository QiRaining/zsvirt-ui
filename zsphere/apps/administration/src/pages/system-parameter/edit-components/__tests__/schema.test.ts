import { createMockIntl } from "@zstack/form/testing";
import { describe, expect, it } from "vitest";

import {
  createAuditRetentionDurationSchema,
  createConditionalDynamicGlobalConfigSchema,
  createCpuModeSelectSchema,
  createDynamicGlobalConfigSchema,
  createInputWithPasswordSchema,
  createLinkageCpuModeSchema,
  createManagementServerLogSizeSchema,
  createManagementServerLogLastModifiedSchema,
  createPasswordRangeSchema,
  createUiLoginPortalSchema,
  createSetCrashStrategySchema,
  createSetCrashRebootSchema,
  createSwitchModalSchema,
  getDynamicValue,
  getCrashStrategyPayloadValue,
} from "../schema";

const intl = createMockIntl();

const getFieldErrors = (error: unknown) => {
  if (error && typeof error === "object" && "flatten" in error) {
    return (
      error as { flatten: () => { fieldErrors: Record<string, string[]> } }
    ).flatten().fieldErrors;
  }

  throw error;
};

describe("system parameter edit schemas", () => {
  it("requires crash reboot duration and times", () => {
    const schema = createSetCrashRebootSchema(intl);

    expect(() => schema.parse({ duration: "", times: "3" })).toThrow(
      "输入内容不能为空",
    );
    expect(() => schema.parse({ duration: "5", times: "" })).toThrow(
      "输入内容不能为空",
    );
  });

  it("requires positive integer crash reboot values", () => {
    const schema = createSetCrashRebootSchema(intl);

    expect(() => schema.parse({ duration: "abc", times: "3" })).toThrow(
      "请输入数字",
    );
    expect(() => schema.parse({ duration: "0", times: "3" })).toThrow(
      "输入内容需大于0",
    );
    expect(() => schema.parse({ duration: "1.5", times: "3" })).toThrow(
      "请输入整数",
    );
    expect(schema.parse({ duration: "5", times: "3" })).toEqual({
      duration: "5",
      times: "3",
    });
  });

  it("keeps switch modal boolean shape", () => {
    const schema = createSwitchModalSchema();

    expect(schema.parse({ enabled: true })).toEqual({ enabled: true });
    expect(schema.parse({ enabled: false })).toEqual({ enabled: false });
    expect(() => schema.parse({ enabled: "true" })).toThrow();
  });

  it("keeps crash strategy switch and select state", () => {
    const schema = createSetCrashStrategySchema();

    expect(
      schema.parse({ faultDetection: true, crashStrategy: "Reboot" }),
    ).toEqual({
      faultDetection: true,
      crashStrategy: "Reboot",
    });
    expect(
      schema.parse({ faultDetection: false, crashStrategy: "Preserve" }),
    ).toEqual({
      faultDetection: false,
      crashStrategy: "Preserve",
    });
    expect(() =>
      schema.parse({ faultDetection: true, crashStrategy: "Migrate" }),
    ).toThrow();
  });

  it("maps crash strategy payload value like the old form", () => {
    expect(
      getCrashStrategyPayloadValue({
        faultDetection: false,
        crashStrategy: "Reboot",
      }),
    ).toBe("None");
    expect(
      getCrashStrategyPayloadValue({
        faultDetection: true,
        crashStrategy: "Shutdown",
      }),
    ).toBe("Shutdown");
  });

  it("validates management server log retention only when enabled", () => {
    const schema = createManagementServerLogLastModifiedSchema(intl);

    expect(schema.parse({ setting: false, retentionTime: "" })).toEqual({
      setting: false,
      retentionTime: "",
    });
    expect(schema.parse({ setting: true, retentionTime: 1 })).toEqual({
      setting: true,
      retentionTime: 1,
    });
    expect(() => schema.parse({ setting: true, retentionTime: "" })).toThrow(
      "不能为空",
    );
    try {
      schema.parse({ setting: true, retentionTime: "" });
    } catch (error) {
      expect(getFieldErrors(error).retentionTime).toContain("不能为空");
    }
    expect(() => schema.parse({ setting: true, retentionTime: 0 })).toThrow(
      "输入内容应该为整数数字，设置数值不得小于1",
    );
    try {
      schema.parse({ setting: true, retentionTime: 0 });
    } catch (error) {
      expect(getFieldErrors(error).retentionTime).toContain(
        "输入内容应该为整数数字，设置数值不得小于1",
      );
    }
    expect(() => schema.parse({ setting: true, retentionTime: 1.5 })).toThrow(
      "输入内容应该为整数数字，设置数值不得小于1",
    );
  });

  it("validates audit retention duration only when enabled", () => {
    const schema = createAuditRetentionDurationSchema(intl);

    expect(schema.parse({ setting: false, retentionTime: "" })).toEqual({
      setting: false,
      retentionTime: "",
    });
    expect(schema.parse({ setting: true, retentionTime: 365 })).toEqual({
      setting: true,
      retentionTime: 365,
    });
    expect(() => schema.parse({ setting: true, retentionTime: "" })).toThrow(
      "不能为空",
    );
    try {
      schema.parse({ setting: true, retentionTime: "" });
    } catch (error) {
      expect(getFieldErrors(error).retentionTime).toContain("不能为空");
    }
    expect(() => schema.parse({ setting: true, retentionTime: 0 })).toThrow(
      "输入内容应该为整数数字，设置数值在[1,365]之间",
    );
    try {
      schema.parse({ setting: true, retentionTime: 0 });
    } catch (error) {
      expect(getFieldErrors(error).retentionTime).toContain(
        "输入内容应该为整数数字，设置数值在[1,365]之间",
      );
    }
    expect(() => schema.parse({ setting: true, retentionTime: 366 })).toThrow(
      "输入内容应该为整数数字，设置数值在[1,365]之间",
    );
    try {
      schema.parse({ setting: true, retentionTime: 366 });
    } catch (error) {
      expect(getFieldErrors(error).retentionTime).toContain(
        "输入内容应该为整数数字，设置数值在[1,365]之间",
      );
    }
  });

  it("keeps management server log size validation only when enabled", () => {
    const schema = createManagementServerLogSizeSchema(intl);

    expect(schema.parse({ setting: false, size: "" })).toEqual({
      setting: false,
      size: "",
    });
    expect(schema.parse({ setting: true, size: 1 })).toEqual({
      setting: true,
      size: 1,
    });
    expect(() => schema.parse({ setting: true, size: "" })).toThrow("不能为空");
    expect(() => schema.parse({ setting: true, size: 0 })).toThrow(
      "输入内容应该为整数数字，设置数值不得小于1",
    );
  });

  it("runs legacy global config rules for dynamic field names", async () => {
    const schema = createDynamicGlobalConfigSchema({
      "test.name": [
        {
          validator: (_rule, value) =>
            value === "valid"
              ? Promise.resolve()
              : Promise.reject("旧校验错误"),
        },
      ],
    });

    await expect(schema.parseAsync({ "test.name": "" })).rejects.toThrow(
      "旧校验错误",
    );
    await expect(schema.parseAsync({ "test.name": "valid" })).resolves.toEqual({
      "test.name": "valid",
    });
  });

  it("runs legacy global config rules for dotted RHF field paths", async () => {
    const schema = createDynamicGlobalConfigSchema({
      "virtualization.imagestore.reclaim.interval": [
        {
          required: true,
          message: "不能为空",
        },
      ],
    });

    await expect(
      schema.parseAsync({
        virtualization: {
          imagestore: {
            reclaim: {
              interval: {
                number: "",
                unit: "d",
              },
            },
          },
        },
      }),
    ).rejects.toThrow("不能为空");
    await expect(
      schema.parseAsync({
        virtualization: {
          imagestore: {
            reclaim: {
              interval: {
                number: "5",
                unit: "d",
              },
            },
          },
        },
      }),
    ).resolves.toEqual({
      virtualization: {
        imagestore: {
          reclaim: {
            interval: {
              number: "5",
              unit: "d",
            },
          },
        },
      },
    });
  });

  it("reads dynamic values from flat keys and RHF nested paths", () => {
    expect(getDynamicValue({ "a.b": "flat" }, "a.b")).toBe("flat");
    expect(getDynamicValue({ a: { b: "nested" } }, "a.b")).toBe("nested");
  });

  it("only runs legacy global config rules when conditional field is visible", async () => {
    const schema = createConditionalDynamicGlobalConfigSchema(
      (values) => Boolean(values.enabled),
      {
        level: [
          {
            required: true,
            message: "级别不能为空",
          },
        ],
      },
    );

    await expect(
      schema.parseAsync({ enabled: false, level: { number: "" } }),
    ).resolves.toEqual({
      enabled: false,
      level: { number: "" },
    });
    await expect(
      schema.parseAsync({ enabled: true, level: { number: "" } }),
    ).rejects.toThrow("级别不能为空");
    await expect(
      schema.parseAsync({ enabled: true, level: { number: "1" } }),
    ).resolves.toEqual({
      enabled: true,
      level: { number: "1" },
    });
  });

  it("keeps ui login portal risk acknowledgement required", async () => {
    const schema = createUiLoginPortalSchema(intl, "ui.login.portal");

    await expect(
      schema.parseAsync({
        "ui.login.portal": "all",
        acceptRisk: false,
      }),
    ).rejects.toThrow("请先勾选风险提示");
    await expect(
      schema.parseAsync({
        "ui.login.portal": "all",
        acceptRisk: true,
      }),
    ).resolves.toEqual({
      "ui.login.portal": "all",
      acceptRisk: true,
    });
  });

  it("keeps input password confirm validation", async () => {
    const schema = createInputWithPasswordSchema(intl, "password");

    await expect(
      schema.parseAsync({ password: "abc", confirm: "" }),
    ).rejects.toThrow("确认密码必填");
    await expect(
      schema.parseAsync({ password: "abc", confirm: "def" }),
    ).rejects.toThrow("两次输入密码不一致，请重新输入一致的密码。");
    await expect(
      schema.parseAsync({ password: "abc", confirm: "abc" }),
    ).resolves.toEqual({ password: "abc", confirm: "abc" });
  });

  it("validates password range only when enabled", () => {
    const schema = createPasswordRangeSchema(intl, {
      min: 8,
      max: 32,
      minimumTooSmallMessage: {
        id: "cannot.be.less.than.eight",
        defaultMessage: "Enter an integer no smaller than 8.",
      },
      maximumTooLargeMessage: {
        id: "cannot.be.greater.than.thirty-two",
        defaultMessage: "Enter an integer no greater than 32.",
      },
      requireInteger: true,
    });

    expect(
      schema.parse({
        enabled: false,
        minimum: "",
        maximum: "",
        checkOther: false,
      }),
    ).toEqual({
      enabled: false,
      minimum: "",
      maximum: "",
      checkOther: false,
    });
    expect(
      schema.parse({
        enabled: true,
        minimum: 8,
        maximum: 32,
        checkOther: true,
      }),
    ).toEqual({
      enabled: true,
      minimum: 8,
      maximum: 32,
      checkOther: true,
    });
    expect(() =>
      schema.parse({
        enabled: true,
        minimum: 7,
        maximum: 32,
        checkOther: false,
      }),
    ).toThrow("不能小于8");
    expect(() =>
      schema.parse({
        enabled: true,
        minimum: 8,
        maximum: 33,
        checkOther: false,
      }),
    ).toThrow("不能大于32");
    expect(() =>
      schema.parse({
        enabled: true,
        minimum: 12,
        maximum: 10,
        checkOther: false,
      }),
    ).toThrow("不能小于最小值");
    expect(() =>
      schema.parse({
        enabled: true,
        minimum: 8.5,
        maximum: 32,
        checkOther: false,
      }),
    ).toThrow("请输入整数");
  });

  it("keeps linkage cpu mode value shape", () => {
    const schema = createLinkageCpuModeSchema();

    expect(schema.parse({ cpuMode: "host-model" })).toEqual({
      cpuMode: "host-model",
    });
    expect(schema.parse({ cpuMode: "custom-model" })).toEqual({
      cpuMode: "custom-model",
    });
  });

  it("keeps cpu mode select value shape", () => {
    const schema = createCpuModeSelectSchema();

    expect(() => schema.parse({ firstSelect: "", secondSelect: "" })).toThrow();
    expect(schema.parse({ firstSelect: "host-model" })).toEqual({
      firstSelect: "host-model",
    });
    expect(
      schema.parse({ firstSelect: "__custom__", secondSelect: "Skylake" }),
    ).toEqual({
      firstSelect: "__custom__",
      secondSelect: "Skylake",
    });
  });
});
