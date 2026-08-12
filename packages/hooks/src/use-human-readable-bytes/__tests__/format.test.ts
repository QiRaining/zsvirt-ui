import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useHumanReadableBytes } from "../index";

describe("useHumanReadableBytes", () => {
  it("should return a function", () => {
    const { result } = renderHook(() => useHumanReadableBytes());
    expect(typeof result.current.format).toBe("function");
  });

  it("should return '0 B' for 0 bytes", () => {
    const { result } = renderHook(() => useHumanReadableBytes());
    expect(result.current.format(0)).toBe("0 B");
  });

  it("should return '0 B' for non-number input", () => {
    const { result } = renderHook(() => useHumanReadableBytes());
    // @ts-expect-error Testing invalid input
    expect(result.current.format("not a number")).toBe("0 B");
    expect(result.current.format(NaN)).toBe("0 B");
    expect(result.current.format()).toBe("0 B");
  });

  it("should correctly format byte values", () => {
    const { result } = renderHook(() => useHumanReadableBytes());
    const testCases = [
      { input: 1, expected: "1 B" },
      { input: 1024, expected: "1 KB" },
      { input: 1048576, expected: "1 MB" },
      { input: 1073741824, expected: "1 GB" },
      { input: 1099511627776, expected: "1 TB" },
      { input: 2.5 * 1024 * 1024, expected: "2.5 MB" },
      { input: 1.23 * 1024 * 1024 * 1024, expected: "1.23 GB" },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(result.current.format(input)).toBe(expected);
    });
  });
});
