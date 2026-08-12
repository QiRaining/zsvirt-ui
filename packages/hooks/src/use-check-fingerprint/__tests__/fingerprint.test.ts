import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { renderHook } from "@testing-library/react";
import MD5 from "crypto-js/md5";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useCheckFingerprint } from "../index";

// 模拟 FingerprintJS
vi.mock("@fingerprintjs/fingerprintjs", () => ({
  default: {
    load: vi.fn().mockResolvedValue({
      get: vi.fn().mockResolvedValue({
        components: {
          fonts: { value: ["Arial"] },
          domBlockers: { value: false },
          audio: { value: "test_audio" },
          screenFrame: { value: [0, 0, 0, 0] },
          canvas: { value: "test_canvas" },
          osCpu: { value: "test_cpu" },
          languages: { value: ["zh-CN"] },
          colorDepth: { value: 24 },
          deviceMemory: { value: 8 },
          screenResolution: { value: [1920, 1080] },
          hardwareConcurrency: { value: 8 },
          timezone: { value: "Asia/Shanghai" },
          platform: { value: "Win32" },
        },
      }),
    }),
    hashComponents: vi.fn().mockReturnValue("mock_fingerprint"),
  },
}));

// 模拟 localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// 模拟 window.logManager
const mockLogManager = {
  log: vi.fn(),
};
Object.defineProperty(window, "logManager", {
  value: mockLogManager,
});

describe("useCheckFingerprint", () => {
  const mockHistory = {
    push: vi.fn(),
  };
  const localKey = "test_fp_key";
  const version = "1.0.0";
  const product = "test_product";

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLogManager.log.mockClear();
    vi.useFakeTimers(); // 使用假定时器
  });

  afterEach(() => {
    vi.useRealTimers(); // 恢复真实定时器
  });

  it("应该在首次运行时设置指纹", async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "sessionId") {
        return "test_session_id";
      }
      return null;
    });

    renderHook(() =>
      useCheckFingerprint(mockHistory, localKey, version, product),
    );

    await vi.runAllTimersAsync();

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(mockHistory.push).not.toHaveBeenCalled();

    // 验证存储的指纹格式是否正确
    const storedHash = MD5("test_session_idmock_fingerprint").toString();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(localKey, storedHash);
  });

  it("当指纹不匹配时应该重定向到登录页面并记录日志", async () => {
    const oldHash = "old_hash";
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "sessionId") {
        return "test_session_id";
      }
      if (key === localKey) {
        return oldHash;
      }
      return null;
    });

    renderHook(() =>
      useCheckFingerprint(mockHistory, localKey, version, product),
    );

    await vi.runAllTimersAsync();

    // 验证日志记录
    expect(mockLogManager.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "info",
        eventType: "check_fp",
        version,
        product,
        sessionId: "test_session_id",
      }),
    );

    // 验证重定向
    expect(mockHistory.push).toHaveBeenCalledWith("/login");
  });

  it("当指纹匹配时不应该重定向", async () => {
    const mockFp = "mock_fingerprint";
    const mockHash = MD5(`test_session_id${mockFp}`).toString();

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "sessionId") {
        return "test_session_id";
      }
      if (key === localKey) {
        return mockHash;
      }
      return null;
    });

    renderHook(() =>
      useCheckFingerprint(mockHistory, localKey, version, product),
    );

    await vi.runAllTimersAsync();

    expect(mockHistory.push).not.toHaveBeenCalled();
    expect(mockLogManager.log).not.toHaveBeenCalled();
  });

  it("当发生错误时应该优雅处理", async () => {
    // 模拟 FingerprintJS.load 抛出错误
    const mockError = new Error("Failed to load fingerprint");
    vi.spyOn(FingerprintJS, "load").mockRejectedValueOnce(mockError);

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "sessionId") {
        return "test_session_id";
      }
      return null;
    });

    renderHook(() =>
      useCheckFingerprint(mockHistory, localKey, version, product),
    );

    await vi.runAllTimersAsync();

    // 验证错误不会导致应用崩溃
    expect(mockHistory.push).not.toHaveBeenCalled();
    expect(mockLogManager.log).not.toHaveBeenCalled();
  });
});
