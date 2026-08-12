import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useCopy } from "../index"; // 假设你的原始文件名为useCopy.ts

describe("useCopy", () => {
  const originalClipboard = { ...navigator.clipboard };
  const originalExecCommand = document.execCommand;

  beforeEach(() => {
    // 模拟 navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // 模拟 document.execCommand
    document.execCommand = vi.fn().mockReturnValue(true);

    // 模拟 window.isSecureContext
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    // 恢复原始的 navigator.clipboard
    Object.assign(navigator, { clipboard: originalClipboard });

    // 恢复原始的 document.execCommand
    document.execCommand = originalExecCommand;

    // 清除所有模拟
    vi.clearAllMocks();
  });

  it("should use navigator.clipboard.writeText when available", async () => {
    const copy = useCopy();
    const content = "Test content";

    await copy(content);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content);
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it("should use fallback method when navigator.clipboard is not available", async () => {
    // 模拟不安全的上下文
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: false,
    });

    const copy = useCopy();
    const content = "Test content";

    await copy(content);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  it("should handle errors in fallback method", async () => {
    // 模拟不安全的上下文
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: false,
    });

    // 模拟 document.execCommand 抛出错误
    document.execCommand = vi.fn().mockImplementation(() => {
      throw new Error("execCommand error");
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const copy = useCopy();
    const content = "Test content";

    await copy(content);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unable to copy to clipboard",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
