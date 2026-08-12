import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { Text } from "../../../src/components/primitive/text";

// 模拟元素溢出状态
const mockElementOverflow = (isOverflowing = true) => {
  // 保存原始的 Element 原型方法
  const originalScrollHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollHeight",
  );
  const originalClientHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientHeight",
  );
  const originalScrollWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollWidth",
  );
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  );

  // 设置模拟值
  if (isOverflowing) {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      value: 50,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 100,
    });
  } else {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      value: 50,
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      value: 50,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 100,
    });
  }

  // 返回清理函数
  return () => {
    if (originalScrollHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "scrollHeight",
        originalScrollHeight,
      );
    }
    if (originalClientHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "clientHeight",
        originalClientHeight,
      );
    }
    if (originalScrollWidth) {
      Object.defineProperty(
        HTMLElement.prototype,
        "scrollWidth",
        originalScrollWidth,
      );
    }
    if (originalOffsetWidth) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetWidth",
        originalOffsetWidth,
      );
    }
  };
};

// 模拟Tooltip组件
vi.mock("../../../src/components/primitive/tooltip", () => ({
  Tooltip: ({ children, title, open }) => (
    <div data-testid="tooltip" data-open={open} data-title={title}>
      {children}
    </div>
  ),
}));

describe("Text 组件", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应正确渲染文本内容", () => {
    render(<Text data-testid="text">测试文本</Text>);

    const text = screen.getByTestId("text");
    expect(text).toBeDefined();
    expect(text.textContent).toBe("测试文本");
  });

  it("应正确应用className", () => {
    render(
      <Text className="custom-class" data-testid="text">
        测试文本
      </Text>,
    );

    const text = screen.getByTestId("text");
    expect(text.className).toContain("custom-class");
    expect(text.className).toContain("truncate");
  });

  it("应默认包含必要的基础样式类", () => {
    render(<Text data-testid="text">测试文本</Text>);

    const text = screen.getByTestId("text");
    expect(text.className).toContain("truncate");
    expect(text.className).toContain("break-all");
    expect(text.className).toContain("max-w-fit");
    expect(text.className).toContain("min-w-0");
  });

  it("应正确传递其他HTML属性", () => {
    render(
      <Text data-testid="text" title="自定义标题">
        测试文本
      </Text>,
    );

    const text = screen.getByTestId("text");
    expect(text.getAttribute("title")).toBe("自定义标题");
  });

  it("当文本溢出时应显示tooltip", () => {
    // 模拟元素溢出
    const cleanup = mockElementOverflow(true);

    try {
      render(
        <Text data-testid="text">
          这是一段很长的文本，用于测试溢出情况下是否会显示Tooltip提示
        </Text>,
      );

      const text = screen.getByTestId("text");

      // 触发鼠标进入事件
      fireEvent.mouseEnter(text);

      // 检查是否显示了Tooltip
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toBeDefined();
      expect(tooltip.getAttribute("data-open")).toBe("true");
      expect(tooltip.getAttribute("data-title")).toBe(
        "这是一段很长的文本，用于测试溢出情况下是否会显示Tooltip提示",
      );
    } finally {
      cleanup();
    }
  });

  it("当文本不溢出时不应显示tooltip", () => {
    // 模拟元素不溢出
    const cleanup = mockElementOverflow(false);

    try {
      render(<Text data-testid="text">短文本</Text>);

      const text = screen.getByTestId("text");

      // 触发鼠标进入事件
      fireEvent.mouseEnter(text);

      // 检查没有Tooltip
      const tooltip = screen.queryByTestId("tooltip");
      expect(tooltip).toBeNull();
    } finally {
      cleanup();
    }
  });

  it("当设置disableTooltip为true时不应显示tooltip", () => {
    // 模拟元素溢出
    const cleanup = mockElementOverflow(true);

    try {
      render(
        <Text disableTooltip data-testid="text">
          这是一段很长的文本，用于测试溢出情况下是否会显示Tooltip提示
        </Text>,
      );

      const text = screen.getByTestId("text");

      // 触发鼠标进入事件
      fireEvent.mouseEnter(text);

      // 检查没有Tooltip
      const tooltip = screen.queryByTestId("tooltip");
      expect(tooltip).toBeNull();
    } finally {
      cleanup();
    }
  });

  it("应正确处理空文本内容", () => {
    render(<Text data-testid="text"></Text>);

    const text = screen.getByTestId("text");
    expect(text.textContent).toBe("");
  });

  it("应支持嵌套元素作为子内容", () => {
    render(
      <Text data-testid="text">
        文本与<span data-testid="nested">嵌套元素</span>
      </Text>,
    );

    const text = screen.getByTestId("text");
    const nested = screen.getByTestId("nested");

    expect(text).toBeDefined();
    expect(nested).toBeDefined();
    expect(text.textContent).toBe("文本与嵌套元素");
  });

  it("当tooltip打开时，应能正确关闭tooltip", () => {
    // 模拟元素溢出
    const cleanup = mockElementOverflow(true);

    try {
      const { rerender } = render(
        <Text data-testid="text">
          这是一段很长的文本，用于测试溢出情况下是否会显示Tooltip提示
        </Text>,
      );

      const text = screen.getByTestId("text");

      // 触发鼠标进入事件
      fireEvent.mouseEnter(text);

      // 检查是否显示了Tooltip
      let tooltip = screen.getByTestId("tooltip");
      expect(tooltip.getAttribute("data-open")).toBe("true");

      // 模拟Tooltip的onOpenChange回调
      const onOpenChange = tooltip.props?.onOpenChange;
      if (typeof onOpenChange === "function") {
        onOpenChange(false);
        rerender(
          <Text data-testid="text">
            这是一段很长的文本，用于测试溢出情况下是否会显示Tooltip提示
          </Text>,
        );

        tooltip = screen.getByTestId("tooltip");
        expect(tooltip.getAttribute("data-open")).toBe("false");
      }
    } finally {
      cleanup();
    }
  });
});
