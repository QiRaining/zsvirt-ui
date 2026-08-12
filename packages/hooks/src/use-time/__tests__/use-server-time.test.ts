/**
 * @vitest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useServerTime } from "../use-server-time";

// 模拟 Apollo Client
vi.mock("@apollo/client", () => ({
  gql: vi.fn(),
  useLazyQuery: vi.fn(),
}));

import { useLazyQuery } from "@apollo/client";

describe("useServerTime", () => {
  const mockServerResponse = {
    getCurrentTime: {
      currentTime: {
        MillionSeconds: 1640995200000, // 2022-01-01 00:00:00
        Seconds: 1640995200,
      },
      timezone: "Asia/Shanghai",
      offset: 480,
    },
  };

  const fixedTime = 1640995201000; // 2022-01-01 00:00:01 (1秒后)

  beforeEach(() => {
    // 模拟 Date.now()
    vi.spyOn(Date, "now").mockImplementation(() => fixedTime);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("应该正确初始化默认值", () => {
    const mockFetchServerTime = vi.fn();
    (useLazyQuery as any).mockReturnValue([
      mockFetchServerTime,
      {
        refetch: vi.fn(),
        loading: false,
        error: null,
        data: null,
      },
    ]);

    const { result } = renderHook(() => useServerTime());
    expect(result.current.millionSecondsGap).toBe(0);
    expect(result.current.timezone).toBe("");
    expect(mockFetchServerTime).toHaveBeenCalled();
  });

  it("应该能够获取服务器时间", async () => {
    let onCompletedCallback: any;
    const mockFetchServerTime = vi.fn();

    (useLazyQuery as any).mockReturnValue([
      mockFetchServerTime,
      {
        refetch: vi.fn(),
        loading: false,
        error: null,
        data: null,
      },
    ]);

    (useLazyQuery as any).mockImplementation((query: any, options: any) => {
      onCompletedCallback = options.onCompleted;
      return [
        mockFetchServerTime,
        {
          refetch: vi.fn(),
          loading: false,
          error: null,
          data: null,
        },
      ];
    });

    const { result } = renderHook(() => useServerTime());

    // 模拟数据返回
    await act(async () => {
      onCompletedCallback(mockServerResponse);
    });

    // 验证时间差计算
    expect(result.current.millionSecondsGap).toBe(1000); // 1秒的差值
    expect(result.current.timezone).toBe("Asia/Shanghai");
  });

  it("应该处理 Beijing 时区到 Shanghai 时区的转换", async () => {
    let onCompletedCallback: any;
    const mockFetchServerTime = vi.fn();

    (useLazyQuery as any).mockImplementation((query: any, options: any) => {
      onCompletedCallback = options.onCompleted;
      return [
        mockFetchServerTime,
        {
          refetch: vi.fn(),
          loading: false,
          error: null,
          data: null,
        },
      ];
    });

    const { result } = renderHook(() => useServerTime());

    // 模拟返回 Beijing 时区数据
    await act(async () => {
      onCompletedCallback({
        getCurrentTime: {
          ...mockServerResponse.getCurrentTime,
          timezone: "Asia/Beijing",
        },
      });
    });

    expect(result.current.timezone).toBe("Asia/Shanghai");
  });

  it("应该能够重新获取服务器时间", () => {
    const mockRefetch = vi.fn();
    (useLazyQuery as any).mockReturnValue([
      vi.fn(),
      {
        refetch: mockRefetch,
        loading: false,
        error: null,
        data: mockServerResponse,
      },
    ]);

    const { result } = renderHook(() => useServerTime());
    result.current.refetchServerTime();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("应该在组件挂载时自动获取服务器时间", () => {
    const mockFetchServerTime = vi.fn();
    (useLazyQuery as any).mockReturnValue([
      mockFetchServerTime,
      {
        refetch: vi.fn(),
        loading: false,
        error: null,
        data: null,
      },
    ]);

    renderHook(() => useServerTime());
    expect(mockFetchServerTime).toHaveBeenCalled();
  });

  it("应该处理服务器返回空数据的情况", async () => {
    let onCompletedCallback: any;
    const mockFetchServerTime = vi.fn();

    (useLazyQuery as any).mockImplementation((query: any, options: any) => {
      onCompletedCallback = options.onCompleted;
      return [
        mockFetchServerTime,
        {
          refetch: vi.fn(),
          loading: false,
          error: null,
          data: null,
        },
      ];
    });

    const { result } = renderHook(() => useServerTime());

    // 模拟返回空数据
    await act(async () => {
      onCompletedCallback({
        getCurrentTime: {
          currentTime: null,
          timezone: null,
          offset: null,
        },
      });
    });

    expect(result.current.millionSecondsGap).toBe(0);
    expect(result.current.timezone).toBe("");
  });
});
