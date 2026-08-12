import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useLoading } from "../index";

describe("useLoading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("应该正确初始化 loading 状态", () => {
    const mockProps = {
      loading: false,
      refetch: vi.fn(),
    };

    const { result } = renderHook(() => useLoading(mockProps));

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.refetch).toBe("function");
  });

  it("当传入 loading 为 true 时应该反映该状态", () => {
    const mockProps = {
      loading: true,
      refetch: vi.fn(),
    };

    const { result } = renderHook(() => useLoading(mockProps));

    expect(result.current.loading).toBe(true);
  });

  it("调用 refetch 时应该设置 loading 状态", async () => {
    const mockRefetch = vi.fn().mockResolvedValue({ data: { test: true } });
    const mockProps = {
      loading: false,
      refetch: mockRefetch,
    };

    const { result } = renderHook(() => useLoading(mockProps));

    // 初始状态
    expect(result.current.loading).toBe(false);

    // 调用 refetch
    await act(async () => {
      await result.current.refetch();
    });

    // loading 应该变为 true
    expect(result.current.loading).toBe(true);

    // 等待 debounce 时间
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    // loading 应该变回 false
    expect(result.current.loading).toBe(false);
  });

  it("应该使用自定义的等待时间", async () => {
    const customWait = 1000;
    const mockRefetch = vi.fn().mockResolvedValue({ data: { test: true } });
    const mockProps = {
      loading: false,
      refetch: mockRefetch,
      wait: customWait,
    };

    const { result } = renderHook(() => useLoading(mockProps));

    // 调用 refetch
    await act(async () => {
      await result.current.refetch();
    });

    // loading 应该为 true
    expect(result.current.loading).toBe(true);

    // 等待小于自定义时间
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    // loading 应该仍然为 true
    expect(result.current.loading).toBe(true);

    // 等待剩余时间
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    // loading 应该变为 false
    expect(result.current.loading).toBe(false);
  });

  it("多次调用 refetch 时应该正确处理 loading 状态", async () => {
    const mockRefetch = vi.fn().mockResolvedValue({ data: { test: true } });
    const mockProps = {
      loading: false,
      refetch: mockRefetch,
    };

    const { result } = renderHook(() => useLoading(mockProps));

    // 第一次调用
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.loading).toBe(true);

    // 等待 300ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    // 第二次调用
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.loading).toBe(true);

    // 等待 600ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    // loading 应该变为 false
    expect(result.current.loading).toBe(false);
  });

  it("应该正确处理 refetch 失败的情况", async () => {
    const mockError = new Error("Refetch failed");
    const mockRefetch = vi.fn().mockRejectedValue(mockError);
    const mockProps = {
      loading: false,
      refetch: mockRefetch,
    };

    const { result } = renderHook(() => useLoading(mockProps));

    // 调用 refetch
    await act(async () => {
      try {
        await result.current.refetch();
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    // loading 应该为 true
    expect(result.current.loading).toBe(true);

    // 等待 debounce 时间
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    // 即使失败，loading 也应该变回 false
    expect(result.current.loading).toBe(false);
  });

  it("当组件卸载时应该清理定时器", async () => {
    const mockRefetch = vi.fn().mockResolvedValue({ data: { test: true } });
    const mockProps = {
      loading: false,
      refetch: mockRefetch,
    };

    const { result, unmount } = renderHook(() => useLoading(mockProps));

    // 调用 refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.loading).toBe(true);

    // 卸载组件
    unmount();

    // 等待 debounce 时间
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    // loading 状态应该保持不变
    expect(result.current.loading).toBe(true);
  });
});
