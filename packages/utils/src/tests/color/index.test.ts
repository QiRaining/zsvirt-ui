import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  getThemeColor,
  getNeutralColor,
  getSemanticColor,
  getPercentageColor,
  getTagColor,
  changeTheme,
} from "../../color";

describe("Color utilities", () => {
  describe("getThemeColor", () => {
    it("should return correct theme color", () => {
      expect(getThemeColor("blue", "light", 600)).toBeTruthy();
      expect(getThemeColor("red", "dark", 500)).toBeTruthy();
    });

    it("should return empty string for invalid values", () => {
      // @ts-ignore - Testing invalid input
      expect(getThemeColor("blue", "light", 1000)).toBe("");
    });
  });

  describe("getNeutralColor", () => {
    it("should return correct neutral colors for light mode", () => {
      expect(getNeutralColor("light", 700)).toBeTruthy();
      expect(getNeutralColor("light", 100)).toBeTruthy();
    });

    it("should return correct neutral colors for dark mode", () => {
      expect(getNeutralColor("dark", 700)).toBeTruthy();
      expect(getNeutralColor("dark", 100)).toBeTruthy();
    });

    it("should use default values when parameters are omitted", () => {
      expect(getNeutralColor()).toBeTruthy(); // Should use light mode and 700 by default
    });

    it("should return empty string for invalid values", () => {
      // @ts-ignore - Testing invalid input
      expect(getNeutralColor("light", 1000)).toBe("");
    });
  });

  describe("getSemanticColor", () => {
    it("should return correct semantic colors", () => {
      expect(getSemanticColor("positive")).toBeTruthy();
      expect(getSemanticColor("danger")).toBeTruthy();
      expect(getSemanticColor("info")).toBeTruthy();
      expect(getSemanticColor("alert")).toBeTruthy();
    });

    it("should handle disabled state", () => {
      const disabledColor = getSemanticColor("disabled");
      const neutralColor = getNeutralColor("light", 500);
      expect(disabledColor).toBe(neutralColor);
    });

    it("should use default values when parameters are omitted", () => {
      expect(getSemanticColor("positive")).toBeTruthy(); // Should use light mode and 500 by default
    });
  });

  describe("getPercentageColor", () => {
    it("should return correct colors based on percentage", () => {
      expect(getPercentageColor(90)).toBe(
        getSemanticColor("danger", "light", 500),
      );
      expect(getPercentageColor(70)).toBe(
        getSemanticColor("alert", "light", 500),
      );
      expect(getPercentageColor(50)).toBe(
        getSemanticColor("info", "light", 500),
      );
    });

    it("should handle inverse percentage colors", () => {
      expect(getPercentageColor(10, true)).toBe(
        getSemanticColor("danger", "light", 500),
      );
      expect(getPercentageColor(30, true)).toBe(
        getSemanticColor("alert", "light", 500),
      );
      expect(getPercentageColor(50, true)).toBe(
        getSemanticColor("info", "light", 500),
      );
    });

    it("should handle edge cases", () => {
      expect(getPercentageColor(100)).toBe(
        getSemanticColor("danger", "light", 500),
      );
      expect(getPercentageColor(0)).toBe(
        getSemanticColor("info", "light", 500),
      );
      expect(getPercentageColor(0, true)).toBe(
        getSemanticColor("danger", "light", 500),
      );
      expect(getPercentageColor(100, true)).toBe(
        getSemanticColor("info", "light", 500),
      );
    });
  });

  describe("getTagColor", () => {
    it("should convert legacy tag colors to theme colors", () => {
      expect(getTagColor("#186EAE")).toBe(getThemeColor("blue", "light", 600));
      expect(getTagColor("#2CA6E6")).toBe(getThemeColor("teal", "light", 600));
      expect(getTagColor("#7385A8")).toBe(
        getThemeColor("violet", "light", 600),
      );
      expect(getTagColor("#8A65D4")).toBe(
        getThemeColor("purple", "light", 600),
      );
    });

    it("should return original color if no mapping exists", () => {
      const unknownColor = "#123456";
      expect(getTagColor(unknownColor)).toBe(unknownColor);
    });
  });

  describe("changeTheme", () => {
    let originalDocument: typeof document;

    beforeEach(() => {
      // Mock document.body
      document.body.style.setProperty = vi.fn();
      document.body.classList.add = vi.fn();
      document.body.classList.remove = vi.fn();
    });

    it("should set CSS variables for light theme", () => {
      changeTheme({ mode: "light", theme: "blue" });

      expect(document.body.style.setProperty).toHaveBeenCalled();
      expect(document.body.classList.remove).toHaveBeenCalledWith("dark");
    });

    it("should set CSS variables for dark theme", () => {
      changeTheme({ mode: "dark", theme: "blue" });

      expect(document.body.style.setProperty).toHaveBeenCalled();
      expect(document.body.classList.add).toHaveBeenCalledWith("dark");
    });

    it("should handle server-side rendering", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      // Should not throw error when document is undefined
      expect(() => changeTheme({ mode: "light", theme: "blue" })).not.toThrow();

      global.window = originalWindow;
    });
  });
});
