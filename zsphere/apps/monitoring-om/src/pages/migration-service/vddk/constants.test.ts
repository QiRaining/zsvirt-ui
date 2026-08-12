import { describe, expect, it } from "vitest";

import { isValidVddkFileName, isValidVddkPackageMd5 } from "./constants";

describe("isValidVddkPackageMd5", () => {
  it("accepts only the VMware VDDK 8.0.3 for Linux package", () => {
    expect(isValidVddkPackageMd5("007ab979e52f52401f02278b75ab5c74")).toBe(
      true,
    );
    expect(isValidVddkPackageMd5("007AB979E52F52401F02278B75AB5C74")).toBe(
      true,
    );
    expect(isValidVddkPackageMd5("c94b6b8cdf31051106f67df6c28105be")).toBe(
      false,
    );
  });
});

describe("isValidVddkFileName", () => {
  it("accepts the VMware VDDK package naming format", () => {
    expect(
      isValidVddkFileName("VMware-vix-disklib-8.0.3-23124249.x86_64.tar.gz"),
    ).toBe(true);
  });

  it("rejects file names containing characters unsupported by the backend", () => {
    expect(isValidVddkFileName("VMware VDDK 8.0.3.tar.gz")).toBe(false);
    expect(isValidVddkFileName("VDDK(8.0.3).tar.gz")).toBe(false);
    expect(isValidVddkFileName("../vddk.tar.gz")).toBe(false);
  });
});
