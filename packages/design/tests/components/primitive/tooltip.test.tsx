import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
  TooltipRoot,
  TooltipProvider,
  TooltipPortal,
} from "../../../src/components/primitive/tooltip";
import { TooltipProps } from "../../../src/components/primitive/tooltip";

// 模拟ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 全局模拟ResizeObserver
global.ResizeObserver = ResizeObserverMock;

// 模拟usePlacement钩子函数
vi.mock("../../../src/components/primitive/tooltip/use-placement", () => ({
  usePlacement: (placement?: string) => {
    const placementMap: Record<
      string,
      {
        titleSide: "top" | "bottom" | "left" | "right" | undefined;
        titleAlign: "start" | "center" | "end" | undefined;
      }
    > = {
      top: { titleSide: "top", titleAlign: "center" },
      bottom: { titleSide: "bottom", titleAlign: "center" },
      left: { titleSide: "left", titleAlign: "center" },
      right: { titleSide: "right", titleAlign: "center" },
      topLeft: { titleSide: "top", titleAlign: "end" },
      topRight: { titleSide: "top", titleAlign: "start" },
      bottomLeft: { titleSide: "bottom", titleAlign: "end" },
      bottomRight: { titleSide: "bottom", titleAlign: "start" },
      leftTop: { titleSide: "left", titleAlign: "end" },
      leftBottom: { titleSide: "left", titleAlign: "start" },
      rightTop: { titleSide: "right", titleAlign: "end" },
      rightBottom: { titleSide: "right", titleAlign: "start" },
    };
    return (
      placementMap[placement || "top"] || {
        titleSide: undefined,
        titleAlign: undefined,
      }
    );
  },
}));

// 模拟intl
vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({
      id,
      defaultMessage,
    }: {
      id: string;
      defaultMessage?: string;
    }) => defaultMessage || id,
  }),
}));

describe("Tooltip组件", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 测试基本渲染
  it("当提供title时应当正确渲染Tooltip组件", () => {
    render(
      <Tooltip title="测试提示">
        <button>触发器</button>
      </Tooltip>,
    );

    // 检查触发器是否渲染
    expect(screen.getByText("触发器")).toBeTruthy();
  });

  // 测试没有title时应当只渲染子元素
  it("当没有提供title时应当只渲染子元素", () => {
    const { container } = render(
      <Tooltip title="">
        <button>触发器</button>
      </Tooltip>,
    );

    // 检查触发器是否渲染
    expect(screen.getByText("触发器")).toBeTruthy();

    // 检查没有渲染TooltipContent
    const tooltipContent = container.querySelector(
      "[data-radix-tooltip-content]",
    );
    expect(tooltipContent).toBeNull();
  });

  // 测试不同位置的渲染
  it("应当基于placement属性正确设置提示位置", () => {
    const placements: TooltipProps["placement"][] = [
      "top",
      "bottom",
      "left",
      "right",
      "topLeft",
      "topRight",
      "bottomLeft",
      "bottomRight",
      "leftTop",
      "leftBottom",
      "rightTop",
      "rightBottom",
    ];

    placements.forEach((placement) => {
      const { unmount } = render(
        <Tooltip title="测试提示" placement={placement}>
          <button>触发器</button>
        </Tooltip>,
      );

      // 验证渲染成功即可，具体位置由usePlacement处理，已经在mock中模拟了
      expect(screen.getByText("触发器")).toBeTruthy();

      unmount();
    });
  });

  // 测试显示和隐藏
  it("应当支持受控的open状态", () => {
    const onOpenChange = vi.fn();

    const { rerender } = render(
      <Tooltip title="测试提示" open={false} onOpenChange={onOpenChange}>
        <button>触发器</button>
      </Tooltip>,
    );

    // 重新渲染为打开状态
    rerender(
      <Tooltip title="测试提示" open={true} onOpenChange={onOpenChange}>
        <button>触发器</button>
      </Tooltip>,
    );

    // 在实际组件中，此时应该会渲染出tooltip内容，但由于radix的实现，
    // 在测试中我们无法直接验证内容是否可见，只能验证组件不崩溃
    expect(screen.getByText("触发器")).toBeTruthy();
  });

  // 测试点击行为
  it("disappearOnClick设置为false时点击应阻止默认行为", () => {
    render(
      <Tooltip title="测试提示" disappearOnClick={false}>
        <button>触发器</button>
      </Tooltip>,
    );

    const button = screen.getByText("触发器");

    // 触发点击
    // 注意：由于我们无法直接访问内部的onClick处理函数，
    // 这个测试主要是确保组件在这种配置下不会崩溃
    fireEvent.click(button);
  });

  // 测试子组件
  it("应当正确导出子组件", () => {
    // 验证所有子组件都被正确导出
    expect(TooltipContent).toBeDefined();
    expect(TooltipArrow).toBeDefined();
    expect(TooltipTrigger).toBeDefined();
    expect(TooltipRoot).toBeDefined();
    expect(TooltipProvider).toBeDefined();
    expect(TooltipPortal).toBeDefined();
  });

  // 测试自定义样式
  it("应当支持自定义className", () => {
    render(
      <Tooltip title="测试提示" className="custom-tooltip-class">
        <button>触发器</button>
      </Tooltip>,
    );

    expect(screen.getByText("触发器")).toBeTruthy();
    // 注意：由于Radix的实现，tooltip内容在测试中不可直接访问
  });

  // 测试箭头的自定义样式
  it("应当支持自定义arrowClassName", () => {
    render(
      <Tooltip title="测试提示" arrowClassName="custom-arrow-class">
        <button>触发器</button>
      </Tooltip>,
    );

    expect(screen.getByText("触发器")).toBeTruthy();
    // 注意：由于Radix的实现，tooltip箭头在测试中不可直接访问
  });

  // 测试组合使用
  it("应当支持原子化使用模式", () => {
    render(
      <TooltipProvider>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <button>原子化触发器</button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              测试内容
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </TooltipProvider>,
    );

    expect(screen.getByText("原子化触发器")).toBeTruthy();
  });
});
