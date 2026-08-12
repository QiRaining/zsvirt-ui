import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { usePersistTabState } from "../index";

// 模拟window.location
const mockLocation = {
  pathname: "/test-path",
};

describe("usePersistTabStore", () => {
  // 在每个测试前重置location
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });
  });

  it("应该返回默认的第一个tab作为activeKey", () => {
    const tabList = ["tab1", "tab2", "tab3"];
    const contentId = "test-content";

    const { result } = renderHook(() => usePersistTabState(contentId, tabList));
    expect(result.current.activeKey).toBe("tab1");
  });

  it("应该处理对象类型的tabList", () => {
    const tabList = [
      { value: "tab1", label: "Tab 1" },
      { value: "tab2", label: "Tab 2" },
    ];
    const contentId = "test-content";

    const { result } = renderHook(() => usePersistTabState(contentId, tabList));
    expect(result.current.activeKey).toBe("tab1");
  });

  it("应该正确响应onChange事件", () => {
    const tabList = ["tab1", "tab2", "tab3"];
    const contentId = "test-content";

    const { result } = renderHook(() => usePersistTabState(contentId, tabList));

    act(() => {
      result.current.onChange("tab2");
    });

    expect(result.current.activeKey).toBe("tab2");
  });

  it("应该在不同路径下保持独立的状态", () => {
    const tabList = ["tab1", "tab2"];
    const contentId = "test-content";

    // 第一个路径
    mockLocation.pathname = "/path1";
    const { result: result1 } = renderHook(() =>
      usePersistTabState(contentId, tabList),
    );

    act(() => {
      result1.current.onChange("tab2");
    });

    // 第二个路径
    mockLocation.pathname = "/path2";
    const { result: result2 } = renderHook(() =>
      usePersistTabState(contentId, tabList),
    );

    expect(result1.current.activeKey).toBe("tab2");
    expect(result2.current.activeKey).toBe("tab1");
  });

  it("应该响应routerTabTarget参数", () => {
    const tabList = ["tab1", "tab2", "tab3"];
    const contentId = "test-content";
    const routerTabTarget = "tab3";

    const { result } = renderHook(() =>
      usePersistTabState(contentId, tabList, routerTabTarget),
    );

    expect(result.current.activeKey).toBe("tab3");
  });

  it("当记忆的tab不在tabList中时应该返回第一个tab", () => {
    const tabList = ["tab1", "tab2"];
    const contentId = "test-content";

    const { result } = renderHook(() => usePersistTabState(contentId, tabList));

    // 先选择一个有效的tab
    act(() => {
      result.current.onChange("tab2");
    });

    // 重新渲染时使用新的tabList，不包含之前选择的tab
    const newTabList = ["tab3", "tab4"];
    const { result: newResult } = renderHook(() =>
      usePersistTabState(contentId, newTabList),
    );

    expect(newResult.current.activeKey).toBe("tab3");
  });
});
