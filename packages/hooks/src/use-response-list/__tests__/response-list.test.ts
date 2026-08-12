import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

import { useResponseList } from "../index";

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock window.addEventListener
const mockAddEventListener = vi.spyOn(window, "addEventListener");
const mockRemoveEventListener = vi.spyOn(window, "removeEventListener");

describe("useResponseList", () => {
  // 测试数据
  const testList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 在每个测试后重置mock和window属性
  afterEach(() => {
    vi.clearAllMocks();
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
  });

  it("在超大屏幕(xl)下应该返回6列布局", () => {
    // 模拟xl屏幕 (>= 1200px)
    mockInnerWidth(1200);

    const { result } = renderHook(() => useResponseList(testList));
    const [groupedList, colNum] = result.current;

    // 验证列数
    expect(colNum).toBe(6);
    // 验证分组结果
    expect(groupedList).toEqual([
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10],
    ]);
    // 验证事件监听器
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("在大屏幕(lg)下应该返回4列布局", () => {
    // 模拟lg屏幕 (992-1199px)
    mockInnerWidth(992);

    const { result } = renderHook(() => useResponseList(testList));
    const [groupedList, colNum] = result.current;

    // 验证列数
    expect(colNum).toBe(4);
    // 验证分组结果
    expect(groupedList).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10],
    ]);
  });

  it("在中小屏幕下应该返回3列布局", () => {
    // 模拟中小屏幕 (< 992px)
    mockInnerWidth(768);

    const { result } = renderHook(() => useResponseList(testList));
    const [groupedList, colNum] = result.current;

    // 验证列数
    expect(colNum).toBe(3);
    // 验证分组结果
    expect(groupedList).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
  });

  it("应该正确处理空列表", () => {
    // 模拟lg屏幕
    mockInnerWidth(992);

    const { result } = renderHook(() => useResponseList([]));
    const [groupedList, colNum] = result.current;

    // 验证返回空数组和正确的列数
    expect(groupedList).toEqual([]);
    expect(colNum).toBe(4);
  });

  it("应该正确处理undefined输入", () => {
    // 模拟lg屏幕
    mockInnerWidth(992);

    const { result } = renderHook(() => useResponseList());
    const [groupedList, colNum] = result.current;

    // 验证返回空数组和正确的列数
    expect(groupedList).toEqual([]);
    expect(colNum).toBe(4);
  });

  it("应该在屏幕尺寸变化时重新计算布局", async () => {
    // 首先模拟xl屏幕
    mockInnerWidth(1200);

    const { result, rerender } = renderHook(() => useResponseList(testList));

    // 验证xl屏幕下的布局
    expect(result.current[1]).toBe(6);
    expect(result.current[0]).toEqual([
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10],
    ]);

    // 模拟屏幕变化到lg
    act(() => {
      mockInnerWidth(992);
      window.dispatchEvent(new Event("resize"));
    });

    // 重新渲染以确保状态更新
    rerender();

    // 验证lg屏幕下的布局
    expect(result.current[1]).toBe(4);
    expect(result.current[0]).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10],
    ]);
  });

  it("应该在组件卸载时清理事件监听器", () => {
    mockInnerWidth(1200);

    const { unmount } = renderHook(() => useResponseList(testList));

    // 卸载组件
    unmount();

    // 验证事件监听器被清理
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });
});
