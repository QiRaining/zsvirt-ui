import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Badge, BadgeDot } from "../src/components/primitive/badge";

describe("Badge", () => {
  describe("基础功能", () => {
    it("应该正确渲染数字", () => {
      render(<Badge count={5} />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("应该正确渲染字符串", () => {
      render(<Badge count="+188" />);
      expect(screen.getByText("+188")).toBeInTheDocument();
    });

    it("应该正确渲染 children", () => {
      render(<Badge>自定义内容</Badge>);
      expect(screen.getByText("自定义内容")).toBeInTheDocument();
    });

    it("children 优先级应该高于 count", () => {
      render(<Badge count={5}>自定义内容</Badge>);
      expect(screen.getByText("自定义内容")).toBeInTheDocument();
      expect(screen.queryByText("5")).not.toBeInTheDocument();
    });
  });

  describe("最大值限制", () => {
    it("应该在数字超过最大值时显示 max+", () => {
      render(<Badge count={100} max={99} />);
      expect(screen.getByText("99+")).toBeInTheDocument();
    });

    it("应该在数字等于最大值时显示原数字", () => {
      render(<Badge count={99} max={99} />);
      expect(screen.getByText("99")).toBeInTheDocument();
    });

    it("应该在数字小于最大值时显示原数字", () => {
      render(<Badge count={50} max={99} />);
      expect(screen.getByText("50")).toBeInTheDocument();
    });

    it("应该使用默认最大值 99", () => {
      render(<Badge count={100} />);
      expect(screen.getByText("99+")).toBeInTheDocument();
    });
  });

  describe("圆点模式", () => {
    it("应该在圆点模式下不显示内容", () => {
      const { container } = render(<Badge dot count={5} />);
      expect(container.textContent).toBe("");
    });

    it("应该在圆点模式下应用正确的样式", () => {
      const { container } = render(<Badge dot />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("w-[8px]");
      expect(badge).toHaveClass("h-[8px]");
      expect(badge).toHaveClass("rounded-full");
    });
  });

  describe("变体", () => {
    it("应该正确应用 base 变体", () => {
      const { container } = render(<Badge variant="base" count={5} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("bg-neutral-200");
      expect(badge).toHaveClass("text-neutral-800");
    });

    it("应该正确应用 info 变体", () => {
      const { container } = render(<Badge variant="info" count={5} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("bg-info-500");
      expect(badge).toHaveClass("text-neutral-0");
    });

    it("应该正确应用 danger 变体", () => {
      const { container } = render(<Badge variant="danger" count={5} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("bg-danger-500");
      expect(badge).toHaveClass("text-neutral-0");
    });

    it("应该正确应用 alert 变体", () => {
      const { container } = render(<Badge variant="alert" count={5} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("bg-alert-500");
      expect(badge).toHaveClass("text-neutral-0");
    });

    it("应该正确应用 increase 变体", () => {
      const { container } = render(<Badge variant="increase" count="+188" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("bg-positive-100");
      expect(badge).toHaveClass("text-positive-600");
    });

    it("应该正确应用 decrease 变体", () => {
      const { container } = render(<Badge variant="decrease" count="-122" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("bg-danger-100");
      expect(badge).toHaveClass("text-danger-600");
    });
  });

  describe("自定义样式", () => {
    it("应该正确应用自定义 className", () => {
      const { container } = render(
        <Badge count={5} className="custom-class" />,
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("custom-class");
    });
  });

  describe("空状态", () => {
    it("当没有 count 和 children 且不是圆点模式时不应该渲染", () => {
      const { container } = render(<Badge />);
      expect(container.firstChild).toBeNull();
    });

    it("当 count 为 0 时应该渲染", () => {
      render(<Badge count={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("HTML 属性", () => {
    it("应该正确传递其他 HTML 属性", () => {
      const { container } = render(
        <Badge count={5} data-testid="test-badge" />,
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute("data-testid", "test-badge");
    });
  });
});

describe("BadgeDot", () => {
  it("应该渲染为圆点模式", () => {
    const { container } = render(<BadgeDot />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("w-[8px]");
    expect(badge).toHaveClass("h-[8px]");
    expect(badge).toHaveClass("rounded-full");
  });

  it("应该默认使用 danger 变体", () => {
    const { container } = render(<BadgeDot />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("bg-danger-500");
  });

  it("应该支持自定义变体", () => {
    const { container } = render(<BadgeDot variant="info" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("bg-info-500");
  });

  it("应该支持自定义 className", () => {
    const { container } = render(<BadgeDot className="custom-class" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("custom-class");
  });
});
