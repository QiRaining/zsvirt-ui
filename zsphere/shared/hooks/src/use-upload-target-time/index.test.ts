import { describe, expect, it } from "vitest";

import {
  getTargetUploadTimeByMaxIdleDuration,
  getUploadGlobalConfigCategory,
  parseUploadMaxIdleDuration,
} from ".";

describe("useUploadTargetTime helpers", () => {
  it("maps upload types to global config categories", () => {
    expect(getUploadGlobalConfigCategory("image")).toBe("image");
    expect(getUploadGlobalConfigCategory("storagePackage")).toBe(
      "softwarePackage",
    );
    expect(getUploadGlobalConfigCategory("migrationServicePackage")).toBe(
      "softwarePackage",
    );
  });

  it("prefers value, falls back to defaultValue, then keeps the old safety default", () => {
    expect(parseUploadMaxIdleDuration("60", "30")).toBe(60);
    expect(parseUploadMaxIdleDuration("", "60")).toBe(60);
    expect(parseUploadMaxIdleDuration("invalid", "60")).toBe(60);
    expect(parseUploadMaxIdleDuration("invalid", "also-invalid")).toBe(30);
    expect(parseUploadMaxIdleDuration(undefined, undefined)).toBe(30);
  });

  it("keeps a 10 second buffer and clamps tiny values", () => {
    expect(getTargetUploadTimeByMaxIdleDuration(30)).toBe(20);
    expect(getTargetUploadTimeByMaxIdleDuration(60)).toBe(50);
    expect(getTargetUploadTimeByMaxIdleDuration(10)).toBe(1);
  });
});
