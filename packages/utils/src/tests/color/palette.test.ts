import { describe, it, expect } from "vitest";

import palette from "../../color/palette";

describe("Color Palette", () => {
  describe("Light Theme", () => {
    it("should have all required color schemes", () => {
      expect(palette.light).toBeDefined();
      expect(palette.light.blue).toBeDefined();
      expect(palette.light.green).toBeDefined();
      expect(palette.light.purple).toBeDefined();
      expect(palette.light.red).toBeDefined();
      expect(palette.light.teal).toBeDefined();
      expect(palette.light.violet).toBeDefined();
      expect(palette.light.yellow).toBeDefined();
      expect(palette.light["yellow-green"]).toBeDefined();
      expect(palette.light.neutral).toBeDefined();
      expect(palette.light.semantic).toBeDefined();
    });

    it("should have correct color values", () => {
      // 测试一些具体的颜色值
      expect(palette.light.blue).toEqual({
        "@color-50": "#E6F6FF",
        "@color-100": "#CEEFFF",
        "@color-200": "#98D7FE",
        "@color-300": "#65BBFC",
        "@color-400": "#3EA1FA",
        "@color-500": "#0076F7",
        "@color-600": "#005BD4",
        "@color-700": "#0043B1",
        "@color-800": "#052E82",
        "@color-900": "#041E63",
        "@color-ai-100": "#F1F8FF",
        "@color-ai-200": "#E6F2FF",
      });

      expect(palette.light.green).toEqual({
        "@color-50": "#ECFEDF",
        "@color-100": "#DFFCC6",
        "@color-200": "#C9F7AE",
        "@color-300": "#AEF193",
        "@color-400": "#8BE374",
        "@color-500": "#57D344",
        "@color-600": "#3AB333",
        "@color-700": "#249627",
        "@color-800": "#107219",
        "@color-900": "#0A5017",
        "@color-ai-100": "#F5FFFC",
        "@color-ai-200": "#D7FFF1",
      });

      expect(palette.light.purple).toEqual({
        "@color-50": "#F9ECFE",
        "@color-100": "#F4DAFD",
        "@color-200": "#E6B5FC",
        "@color-300": "#D18FF6",
        "@color-400": "#BB71EE",
        "@color-500": "#9A45E4",
        "@color-600": "#7A35C3",
        "@color-700": "#5A22A4",
        "@color-800": "#3C1481",
        "@color-900": "#280B66",
        "@color-ai-100": "#FDF9FF",
        "@color-ai-200": "#F8F0FF",
      });
    });

    it("should have valid hex color codes", () => {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      Object.values(palette.light.blue).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe("Dark Theme", () => {
    it("should have all required color schemes", () => {
      expect(palette.dark).toBeDefined();
      expect(palette.dark.blue).toBeDefined();
      expect(palette.dark.green).toBeDefined();
      expect(palette.dark.purple).toBeDefined();
      expect(palette.dark.red).toBeDefined();
      expect(palette.dark.teal).toBeDefined();
      expect(palette.dark.violet).toBeDefined();
      expect(palette.dark.yellow).toBeDefined();
      expect(palette.dark["yellow-green"]).toBeDefined();
      expect(palette.dark.neutral).toBeDefined();
      expect(palette.dark.semantic).toBeDefined();
    });

    it("should have correct color values", () => {
      expect(palette.dark.blue).toEqual({
        "@color-50": "#101C29",
        "@color-100": "#0E263F",
        "@color-200": "#0C2F56",
        "@color-300": "#084990",
        "@color-400": "#0558B2",
        "@color-500": "#016BDF",
        "@color-600": "#3992E2",
        "@color-700": "#5CA9E4",
        "@color-800": "#8AC3E6",
        "@color-900": "#BAD8E7",
      });
    });

    it("should have valid hex color codes", () => {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      Object.values(palette.dark.blue).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe("Theme Structure", () => {
    it("should have consistent structure between light and dark themes", () => {
      const lightKeys = Object.keys(palette.light);
      const darkKeys = Object.keys(palette.dark);
      expect(lightKeys).toEqual(darkKeys);
    });
  });

  describe("Semantic Colors", () => {
    it("should have required semantic colors", () => {
      const requiredSemanticColors = [
        "@positive-50",
        "@info-50",
        "@alert-50",
        "@danger-50",
        "@pending-50",
      ];

      requiredSemanticColors.forEach((color) => {
        expect(palette.light.semantic[color]).toBeDefined();
        expect(palette.dark.semantic[color]).toBeDefined();
      });
    });

    it("should have valid semantic color values", () => {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

      Object.values(palette.light.semantic).forEach((color: string) => {
        expect(color).toMatch(hexColorRegex);
      });

      Object.values(palette.dark.semantic).forEach((color: string) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe("Neutral Colors", () => {
    it("should have required neutral colors", () => {
      const neutralLevels = [
        "@neutral-0",
        "@neutral-100",
        "@neutral-200",
        "@neutral-300",
        "@neutral-400",
        "@neutral-500",
        "@neutral-600",
        "@neutral-700",
        "@neutral-800",
        "@neutral-900",
      ];

      neutralLevels.forEach((level) => {
        expect(palette.light.neutral[level]).toBeDefined();
        expect(palette.dark.neutral[level]).toBeDefined();
      });
    });

    it("should have valid neutral color values", () => {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

      Object.values(palette.light.neutral).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });

      Object.values(palette.dark.neutral).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });
});
