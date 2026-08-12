import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  Button,
  buttonVariants,
} from "../../../src/components/primitive/button";

describe("Button", () => {
  it("应该正确渲染默认按钮", () => {
    render(<Button>测试按钮</Button>);

    const button = screen.getByRole("button", { name: "测试按钮" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-theme-600");
  });

  it("应该支持不同的变体样式", () => {
    const { rerender } = render(<Button variant="primary">主要按钮</Button>);

    let button = screen.getByRole("button", { name: "主要按钮" });
    expect(button).toHaveClass("bg-theme-600");

    rerender(<Button variant="subtle">次要按钮</Button>);
    button = screen.getByRole("button", { name: "次要按钮" });
    expect(button).toHaveClass("bg-transparent");

    rerender(<Button variant="outline">轮廓按钮</Button>);
    button = screen.getByRole("button", { name: "轮廓按钮" });
    expect(button).toHaveClass("border-dashed");

    rerender(<Button variant="secondary">二级按钮</Button>);
    button = screen.getByRole("button", { name: "二级按钮" });
    expect(button).toHaveClass("bg-neutral-200");

    rerender(<Button variant="link">链接按钮</Button>);
    button = screen.getByRole("button", { name: "链接按钮" });
    expect(button).toHaveClass("text-theme-600");

    rerender(<Button variant="danger">危险按钮</Button>);
    button = screen.getByRole("button", { name: "危险按钮" });
    expect(button).toHaveClass("bg-danger-600");

    rerender(<Button variant="ghost">幽灵按钮</Button>);
    button = screen.getByRole("button", { name: "幽灵按钮" });
    expect(button).toHaveClass("bg-transparent");
  });

  it("应该可以通过className添加自定义样式", () => {
    render(<Button className="test-class">自定义按钮</Button>);

    const button = screen.getByRole("button", { name: "自定义按钮" });
    expect(button).toHaveClass("test-class");
    expect(button).toHaveClass("bg-theme-600"); // 仍然保留默认样式
  });

  it("应该正确处理禁用状态", () => {
    render(<Button disabled>禁用按钮</Button>);

    const button = screen.getByRole("button", { name: "禁用按钮" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:cursor-not-allowed");
  });

  it("使用asChild属性时应该正确渲染子元素", () => {
    render(
      <Button asChild>
        <a href="https://example.com">链接按钮</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "链接按钮" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveClass("bg-theme-600"); // 仍然应用按钮样式
  });

  it("应该正确导出buttonVariants", () => {
    expect(typeof buttonVariants).toBe("function");

    const variants = buttonVariants({ variant: "primary" });
    expect(variants).toContain("bg-theme-600");

    const secondaryVariants = buttonVariants({ variant: "secondary" });
    expect(secondaryVariants).toContain("bg-neutral-200");
  });
});
