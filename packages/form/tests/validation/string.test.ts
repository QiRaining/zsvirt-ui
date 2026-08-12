import type { IntlShape } from "react-intl";
import { describe, it, expect } from "vitest";

import { createStringRules } from "../../src/validation/string";

describe("createStringRules", () => {
  // Mock IntlShape
  const mockIntl: IntlShape = {
    formatMessage: ({ defaultMessage }) => defaultMessage,
  } as IntlShape;

  describe("name validation", () => {
    const rules = createStringRules(mockIntl);
    const nameRule = rules.name();

    it("should validate empty strings", () => {
      // 测试空字符串
      expect(() => nameRule.parse("")).toThrow();
      expect(() => nameRule.parse(" ")).toThrow(); // 只有空格
      expect(() => nameRule.parse("\n")).toThrow(); // 换行符
      expect(() => nameRule.parse("\t")).toThrow(); // 制表符
    });

    it("should validate one character", () => {
      // 测试只输入一个
      expect(() => nameRule.parse("1")).not.toThrow(); // 中文
    });

    it("should validate valid characters", () => {
      // 测试有效字符
      expect(nameRule.parse("正常名称")).toBe("正常名称"); // 中文
      expect(nameRule.parse("abc123")).toBe("abc123"); // 英文数字
      expect(nameRule.parse("Test Name")).toBe("Test Name"); // 带空格
      expect(nameRule.parse("test-name")).toBe("test-name"); // 连字符
      expect(nameRule.parse("test.name")).toBe("test.name"); // 点号
      expect(nameRule.parse("test_name")).toBe("test_name"); // 下划线
      expect(nameRule.parse("test(name)")).toBe("test(name)"); // 括号
      expect(nameRule.parse("test:name")).toBe("test:name"); // 冒号
      expect(nameRule.parse("test+name")).toBe("test+name"); // 加号
    });

    it("should validate invalid characters", () => {
      // 测试无效字符
      expect(() => nameRule.parse("test@name")).toThrow(); // @符号
      expect(() => nameRule.parse("test#name")).toThrow(); // #符号
      expect(() => nameRule.parse("test$name")).toThrow(); // $符号
      expect(() => nameRule.parse("test%name")).toThrow(); // %符号
      expect(() => nameRule.parse("test&name")).toThrow(); // &符号
    });

    it("should validate string length", () => {
      // 测试字符串长度
      const customNameRule = rules.name(1, 5);
      expect(customNameRule.parse("abc")).toBe("abc"); // 正常长度
      expect(() => customNameRule.parse("abcdef")).toThrow(); // 太长
    });

    it("should trim input strings", () => {
      // 测试字符串修剪
      expect(nameRule.parse(" test ")).toBe("test"); // 首尾空格
      expect(nameRule.parse("\ttest\t")).toBe("test"); // 制表符
      expect(nameRule.parse("\ntest\n")).toBe("test"); // 换行符
    });
  });

  describe("description validation", () => {
    const rules = createStringRules(mockIntl);
    const descriptionRule = rules.description();

    it("should validate empty description", () => {
      expect(descriptionRule.parse("")).toBe(""); // 允许空描述
      expect(descriptionRule.parse(" ")).toBe(" "); // 允许空格
    });

    it("should validate description length", () => {
      // 测试默认最大长度 (256)
      expect(descriptionRule.parse("a".repeat(256))).toBe("a".repeat(256)); // 最大长度
      expect(() => descriptionRule.parse("a".repeat(257))).toThrow(); // 超过最大长度

      // 测试自定义最大长度
      const customDescriptionRule = rules.description(5);
      expect(customDescriptionRule.parse("12345")).toBe("12345"); // 最大长度
      expect(() => customDescriptionRule.parse("123456")).toThrow(); // 超过最大长度
    });

    it("should allow all characters in description", () => {
      // 测试特殊字符
      const specialChars = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~";
      expect(descriptionRule.parse(specialChars)).toBe(specialChars);

      // 测试多语言字符
      const multiLangChars = "Hello 你好 こんにちは 안녕하세요";
      expect(descriptionRule.parse(multiLangChars)).toBe(multiLangChars);

      // 测试表情符号
      const emojiChars = "👋🌟🎉";
      expect(descriptionRule.parse(emojiChars)).toBe(emojiChars);
    });
  });
});
