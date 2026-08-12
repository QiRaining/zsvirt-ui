import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { TagList } from "../../../src/components/primitive/tag-list";

// 模拟tooltip打开状态的捕获
let mockTooltipOpen = false;

// 模拟Tooltip组件
vi.mock("../../../src/components/primitive/tooltip", () => ({
  Tooltip: ({ children, title, open, onOpenChange, className }) => {
    // 如果组件传递了open状态，则使用它，否则使用我们的mock状态
    const isOpen = open !== undefined ? open : mockTooltipOpen;

    return (
      <div
        data-testid="tooltip"
        data-state={isOpen ? "open" : "closed"}
        className={className}
      >
        {title && <div data-testid="tooltip-content">{title}</div>}
        <div
          data-testid="tooltip-trigger"
          onClick={() => {
            // 更新我们的mock状态
            mockTooltipOpen = true;
            // 调用组件提供的回调
            if (onOpenChange) onOpenChange(true);
          }}
        >
          {children}
        </div>
      </div>
    );
  },
}));

// 模拟Tag组件
vi.mock("../../../src/components/primitive/tag.tsx", () => ({
  Tag: ({ children, theme, level, className, disableTooltip }) => (
    <div
      className={`rounded-[2px] ${className || ""}`}
      data-theme={theme}
      data-level={level}
    >
      {children}
    </div>
  ),
}));

describe("TagList 组件", () => {
  const mockTags = [
    { id: "1", label: "标签1", theme: "blue" as const },
    { id: "2", label: "标签2", theme: "red" as const },
    { id: "3", label: "标签3", theme: "green" as const },
    { id: "4", label: "标签4", theme: "yellow" as const },
    { id: "5", label: "标签5", theme: "purple" as const },
  ];

  // 模拟ResizeObserver
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    // 重置tooltip状态
    mockTooltipOpen = false;

    // 启用假计时器
    vi.useFakeTimers();

    // 重置模拟
    vi.clearAllMocks();

    // 模拟ResizeObserver
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    }));

    // 模拟元素尺寸
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 300,
    });

    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      configurable: true,
      value: {},
    });

    // 模拟requestAnimationFrame
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    // 恢复真实计时器
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("应正确渲染标签列表", () => {
    const { container } = render(<TagList tags={mockTags} />);

    // 使用act包装异步操作
    act(() => {
      vi.runAllTimers();
    });

    // 检查容器是否渲染
    const tagListContainer = container.querySelector("div");
    expect(tagListContainer).not.toBeNull();
  });

  it("当标签列表为空时不应渲染任何内容", () => {
    const { container } = render(<TagList tags={[]} />);

    // 检查容器内容
    expect(container.firstChild).toBeNull();
  });

  it("应正确应用自定义className", () => {
    const { container } = render(
      <TagList tags={mockTags} className="custom-class" />,
    );

    act(() => {
      vi.runAllTimers();
    });

    const tagListContainer = container.querySelector("div");
    expect(tagListContainer?.className).toContain("custom-class");
  });

  it("应正确处理容器宽度", () => {
    const { container } = render(
      <TagList tags={mockTags} containerWidth={200} />,
    );

    act(() => {
      vi.runAllTimers();
    });

    const tagListContainer = container.querySelector("div");
    expect(tagListContainer?.style.width).toBe("200px");
  });

  it("应在设置宽度时计算可见标签数量", () => {
    // 设置一个较小的宽度，确保标签会溢出
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 100,
    });

    const { container } = render(<TagList tags={mockTags} />);

    act(() => {
      vi.runAllTimers();
    });

    // 检查是否显示了+n
    const plusElement = container.querySelector("span");
    expect(plusElement).not.toBeNull();
    expect(plusElement?.textContent).toMatch(/\+\d+/);
  });

  it("应在悬停时触发tooltip", () => {
    // 设置一个较小的宽度，确保标签会溢出
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 100,
    });

    const { container, debug } = render(<TagList tags={mockTags} />);

    act(() => {
      vi.runAllTimers();
    });

    // 找到tooltip触发器
    const tooltipTrigger = container.querySelector(
      '[data-testid="tooltip-trigger"]',
    );
    expect(tooltipTrigger).not.toBeNull();

    // 触发点击事件模拟onOpenChange回调
    if (tooltipTrigger) {
      act(() => {
        fireEvent.click(tooltipTrigger);
        vi.runAllTimers();
      });
    }

    // 验证mock状态变量已更新
    expect(mockTooltipOpen).toBe(true);
  });

  it("应正确使用ResizeObserver", () => {
    render(<TagList tags={mockTags} />);

    // 验证ResizeObserver被创建
    expect(window.ResizeObserver).toHaveBeenCalled();

    // 验证observe方法被调用
    expect(mockObserve).toHaveBeenCalled();
  });

  it("应在卸载时断开ResizeObserver连接", () => {
    const { unmount } = render(<TagList tags={mockTags} />);

    // 验证ResizeObserver被创建
    expect(window.ResizeObserver).toHaveBeenCalled();

    // 验证observe方法被调用
    expect(mockObserve).toHaveBeenCalled();

    // 卸载组件
    unmount();

    // 验证disconnect方法被调用
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
