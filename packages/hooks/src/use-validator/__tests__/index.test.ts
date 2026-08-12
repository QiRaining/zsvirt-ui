/**
 * @vitest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useValidator } from "../index";
import type { RuleObject } from "../type";
import { IIsRequiredType } from "../type";

const ResourceQueryType = {
  Zone: "Zone" as const,
};

// 模拟 intl 对象
const mockIntl = {
  formatMessage: vi.fn(({ defaultMessage }) => defaultMessage),
  locale: "zh-CN",
};

describe("useValidator", () => {
  describe("isRequired 和 isRequiredString", () => {
    it("应该返回输入类型的必填规则", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.isRequired(IIsRequiredType.input);
      expect(rule.required).toBe(true);
      expect(rule.message).toBe("输入内容不能为空");
    });

    it("应该返回选择类型的必填规则", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.isRequired(IIsRequiredType.select);
      expect(rule.required).toBe(true);
      expect(rule.message).toBe("选择不能为空");
    });

    it("应该返回带单位输入类型的必填规则", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.isRequired(IIsRequiredType.inputWithUnit);
      expect(rule.required).toBe(true);
      expect(rule.type).toBe("number");
      expect(rule.transform).toBeDefined();
    });

    it("应该返回字符串必填规则", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.isRequiredString();
      expect(rule.required).toBe(true);
      expect(rule.whitespace).toBe(true);
      expect(rule.message).toBe("输入内容不能为空");
    });
  });

  describe("名称验证相关规则", () => {
    it("应该验证正确的名称格式 (isValidNameString)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.isValidNameString();

      expect(rule.pattern?.test("test123")).toBe(true);
      expect(rule.pattern?.test("测试123")).toBe(true);
      expect(rule.pattern?.test("test-123")).toBe(true);
      expect(rule.pattern?.test(" test123")).toBe(false);
      expect(rule.pattern?.test("test123 ")).toBe(false);
      expect(rule.pattern?.test("test#123")).toBe(false);
    });

    it("应该验证虚拟机组名称格式 (isValidVmGroupNameString)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.isValidVmGroupNameString();

      expect(rule.pattern?.test("test123")).toBe(true);
      expect(rule.pattern?.test("测试123")).toBe(true);
      expect(rule.pattern?.test("test@123")).toBe(true);
      expect(rule.pattern?.test("test【组】")).toBe(true);
      expect(rule.pattern?.test("test#123")).toBe(false);
    });
  });

  describe("范围验证规则", () => {
    it("应该验证字符串长度范围 (lengthRange)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.lengthRange(1, 10);

      expect(rule.type).toBe("string");
      expect(rule.min).toBe(1);
      expect(rule.max).toBe(10);
    });

    it("应该验证数字范围 (numberRange)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.numberRange(1, 100);

      expect(rule.type).toBe("number");
      expect(rule.min).toBe(1);
      expect(rule.max).toBe(100);
      expect(rule.transform).toBeDefined();
    });

    it("应该验证大于某个值 (greatThan)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.greatThan(10);

      expect(rule.validator).toBeDefined();
      return expect(
        rule.validator({} as RuleObject, 11),
      ).resolves.toBeUndefined();
    });

    it("应该验证尺寸范围 (sizeRange)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.sizeRange(1024, 2048);

      expect(rule.type).toBe("number");
      expect(rule.min).toBe(1024);
      expect(rule.max).toBe(2048);
    });
  });

  describe("通用验证器", () => {
    it("应该验证 JSON 字符串 (validJsonParse)", async () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.validJsonParse();

      await expect(
        rule.validator({} as RuleObject, '{"key": "value"}'),
      ).resolves.toBeUndefined();
      await expect(
        rule.validator({} as RuleObject, '{"key": value}'),
      ).rejects.toThrow("不合法的JSON");
    });

    it("应该验证 IP 地址 (ipValidator)", async () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.ipValidator(4);

      await expect(
        rule.validator({} as RuleObject, "192.168.1.1"),
      ).resolves.toBeUndefined();
      await expect(
        rule.validator({} as RuleObject, "256.256.256.256"),
      ).rejects.toThrow("无效的Ipv4 IP地址");
    });

    it("应该验证整数 (integerValidator)", async () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.integerValidator();

      await expect(
        rule.validator({} as RuleObject, 123),
      ).resolves.toBeUndefined();
      await expect(
        rule.validator({} as RuleObject, "123"),
      ).resolves.toBeUndefined();
      await expect(rule.validator({} as RuleObject, 123.45)).rejects.toThrow(
        "请输入整数",
      );
    });

    it("应该验证带单位的整数 (integerWithUnitValidator)", async () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.integerWithUnitValidator();

      await expect(
        rule.validator({} as RuleObject, { number: 123, unit: "MB" }),
      ).resolves.toBeUndefined();
      await expect(
        rule.validator({} as RuleObject, { number: 123.45, unit: "MB" }),
      ).rejects.toThrow("请输入整数");
    });

    it("应该支持自定义验证器 (validatorChecker)", async () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.validatorChecker(
        (value: number) => value > 0,
        "必须大于0",
      );

      await expect(
        rule.validator({} as RuleObject, 1),
      ).resolves.toBeUndefined();
      await expect(rule.validator({} as RuleObject, -1)).rejects.toThrow(
        "必须大于0",
      );
    });

    it("应该支持通用验证器 (commonValidatorChecker)", async () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.commonValidatorChecker(
        (value: number) => value > 0,
        "数字",
      );

      await expect(
        rule.validator({} as RuleObject, 1),
      ).resolves.toBeUndefined();
      await expect(rule.validator({} as RuleObject, -1)).rejects.toThrow(
        "无效的{resource}",
      );
    });

    it("应该支持正则验证器 (regexChecker)", async () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.regexChecker(/^\d+$/, "必须是数字");

      await expect(
        rule.validator({} as RuleObject, "123"),
      ).resolves.toBeUndefined();
      await expect(rule.validator({} as RuleObject, "abc")).rejects.toThrow(
        "必须是数字",
      );
    });

    it("应该支持通用正则验证器 (commonRegexChecker)", async () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.commonRegexChecker(/^\d+$/, "数字");

      await expect(
        rule.validator({} as RuleObject, "123"),
      ).resolves.toBeUndefined();
      await expect(rule.validator({} as RuleObject, "abc")).rejects.toThrow(
        "无效的{resource}",
      );
    });
  });

  describe("资源名称验证", () => {
    it("应该验证资源名称唯一性 (validatorUniqName)", async () => {
      // 模拟 window.g_main
      Object.defineProperty(window, "g_main", {
        value: {
          apolloClient: {
            query: vi
              .fn()
              .mockResolvedValueOnce({ data: { resourceCount: { total: 0 } } })
              .mockResolvedValueOnce({ data: { resourceCount: { total: 1 } } }),
          },
        },
        configurable: true,
      });

      const { result } = renderHook(() => useValidator(mockIntl));
      const rule = result.current.validatorUniqName(ResourceQueryType.Zone);

      await expect(
        rule.validator({} as RuleObject, "newZone"),
      ).resolves.toBeUndefined();
      await expect(
        rule.validator({} as RuleObject, "existingZone"),
      ).rejects.toThrow("名称不能和已有的重复");
    });
  });

  describe("预设规则组合", () => {
    it("应该提供通用名称规则组合 (commonNameRules)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rules = result.current.commonNameRules;

      expect(rules).toHaveLength(3);
      expect(rules[0].required).toBe(true);
      expect(rules[1].max).toBe(128);
      expect(rules[2].type).toBe("string");
    });

    it("应该提供阿里云名称规则组合 (commonAliyunNameRules)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rules = result.current.commonAliyunNameRules;

      expect(rules).toHaveLength(3);
      expect(rules[0].required).toBe(true);
      expect(rules[1].max).toBe(256);
      expect(rules[2].type).toBe("string");
    });

    it("应该提供描述规则组合 (commonDescriptionRules)", () => {
      const { result } = renderHook(() => useValidator(mockIntl));
      const rules = result.current.commonDescriptionRules;

      expect(rules).toHaveLength(1);
      expect(rules[0].max).toBe(256);
    });
  });
});
