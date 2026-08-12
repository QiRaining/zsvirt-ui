import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

// 模拟依赖
vi.mock("@zstack/utils", () => ({
  cn: (...inputs) => inputs.filter(Boolean).join(" "),
}));

// 模拟图标
vi.mock("@zstack/icon", () => ({
  Icon: ({ type, className, onClick, ref, ...props }) => {
    const isUp = type === "arrow-ios-up";
    return (
      <svg
        data-testid={isUp ? "mock-icon-arrow-up" : "mock-icon-arrow-down"}
        className={className}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {isUp ? "向上箭头" : "向下箭头"}
      </svg>
    );
  },
  IconArrowIosUp: ({ className, onClick, ref, ...props }) => (
    <svg
      data-testid="mock-icon-arrow-up"
      className={className}
      onClick={onClick}
      ref={ref}
      {...props}
    >
      向上箭头
    </svg>
  ),
  IconArrowIosDown: ({ className, onClick, ref, ...props }) => (
    <svg
      data-testid="mock-icon-arrow-down"
      className={className}
      onClick={onClick}
      ref={ref}
      {...props}
    >
      向下箭头
    </svg>
  ),
}));

// 导入被测试的组件
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardCollapseIndicator,
} from "../../../src/components/primitive/card";

describe("Card 组件", () => {
  it("应正确渲染基本卡片", () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">卡片标题</CardTitle>
        </CardHeader>
        <CardContent data-testid="card-content">卡片内容</CardContent>
        <CardFooter data-testid="card-footer">卡片底部</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card")).toBeDefined();
    expect(screen.getByTestId("card-header")).toBeDefined();
    expect(screen.getByTestId("card-title")).toBeDefined();
    expect(screen.getByTestId("card-content")).toBeDefined();
    expect(screen.getByTestId("card-footer")).toBeDefined();

    expect(screen.getByText("卡片标题")).toBeDefined();
    expect(screen.getByText("卡片内容")).toBeDefined();
    expect(screen.getByText("卡片底部")).toBeDefined();
  });

  it("应正确应用自定义类名", () => {
    render(
      <Card className="custom-card" data-testid="card">
        <CardHeader className="custom-header" data-testid="card-header">
          <CardTitle className="custom-title" data-testid="card-title">
            标题
          </CardTitle>
        </CardHeader>
        <CardContent className="custom-content" data-testid="card-content">
          内容
        </CardContent>
        <CardFooter className="custom-footer" data-testid="card-footer">
          底部
        </CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card").className).toContain("custom-card");
    expect(screen.getByTestId("card-header").className).toContain(
      "custom-header",
    );
    expect(screen.getByTestId("card-title").className).toContain(
      "custom-title",
    );
    expect(screen.getByTestId("card-content").className).toContain(
      "custom-content",
    );
    expect(screen.getByTestId("card-footer").className).toContain(
      "custom-footer",
    );
  });

  it("应正确渲染卡片描述", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>标题</CardTitle>
          <CardDescription data-testid="card-description">
            卡片描述
          </CardDescription>
        </CardHeader>
      </Card>,
    );

    expect(screen.getByTestId("card-description")).toBeDefined();
    expect(screen.getByText("卡片描述")).toBeDefined();
  });

  it("初始状态下应显示折叠指示器", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>标题</CardTitle>
          <CardCollapseIndicator data-testid="collapse-indicator" />
        </CardHeader>
        <CardContent>内容</CardContent>
      </Card>,
    );

    const collapseIndicator = screen.getByTestId("collapse-indicator");
    expect(collapseIndicator).toBeDefined();
    expect(collapseIndicator.textContent).toBe("向下箭头");
  });

  it("点击折叠指示器应该切换卡片内容的显示状态", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>标题</CardTitle>
          <CardCollapseIndicator data-testid="collapse-indicator" />
        </CardHeader>
        <CardContent data-testid="card-content">内容</CardContent>
      </Card>,
    );

    // 初始状态内容可见且显示向下箭头
    expect(screen.getByTestId("card-content")).toBeDefined();
    const collapseIndicator = screen.getByTestId("collapse-indicator");
    expect(collapseIndicator.textContent).toBe("向下箭头");

    // 点击折叠指示器
    fireEvent.click(collapseIndicator);

    // 内容应隐藏且显示向上箭头
    expect(screen.queryByTestId("card-content")).toBeNull();
    expect(screen.getByTestId("collapse-indicator").textContent).toBe(
      "向上箭头",
    );

    // 再次点击折叠指示器
    fireEvent.click(screen.getByTestId("collapse-indicator"));

    // 内容应再次显示且显示向下箭头
    expect(screen.getByTestId("card-content")).toBeDefined();
    expect(screen.getByTestId("collapse-indicator").textContent).toBe(
      "向下箭头",
    );
  });

  it("折叠状态下不应渲染内容", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>标题</CardTitle>
          <CardCollapseIndicator data-testid="collapse-indicator" />
        </CardHeader>
        <CardContent>内容</CardContent>
      </Card>,
    );

    // 初始状态内容可见
    expect(screen.getByText("内容")).toBeDefined();

    // 点击折叠
    fireEvent.click(screen.getByTestId("collapse-indicator"));

    // 内容应隐藏
    expect(screen.queryByText("内容")).toBeNull();
  });

  it("独立卡片组件之间的折叠状态应该互不影响", () => {
    render(
      <>
        <Card data-testid="card-1">
          <CardHeader>
            <CardTitle>卡片1</CardTitle>
            <CardCollapseIndicator data-testid="collapse-1" />
          </CardHeader>
          <CardContent data-testid="content-1">内容1</CardContent>
        </Card>
        <Card data-testid="card-2">
          <CardHeader>
            <CardTitle>卡片2</CardTitle>
            <CardCollapseIndicator data-testid="collapse-2" />
          </CardHeader>
          <CardContent data-testid="content-2">内容2</CardContent>
        </Card>
      </>,
    );

    // 初始状态两个卡片内容都可见
    expect(screen.getByTestId("content-1")).toBeDefined();
    expect(screen.getByTestId("content-2")).toBeDefined();

    // 折叠第一个卡片
    fireEvent.click(screen.getByTestId("collapse-1"));

    // 第一个卡片内容应隐藏，第二个卡片内容仍可见
    expect(screen.queryByTestId("content-1")).toBeNull();
    expect(screen.getByTestId("content-2")).toBeDefined();
  });

  it("应能正确处理卡片中的复杂内容", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>复杂卡片</CardTitle>
        </CardHeader>
        <CardContent>
          <div data-testid="nested-content">
            <h3>嵌套标题</h3>
            <p>嵌套段落</p>
            <ul>
              <li>列表项1</li>
              <li>列表项2</li>
            </ul>
          </div>
        </CardContent>
      </Card>,
    );

    const nestedContent = screen.getByTestId("nested-content");
    expect(nestedContent).toBeDefined();
    expect(screen.getByText("嵌套标题")).toBeDefined();
    expect(screen.getByText("嵌套段落")).toBeDefined();
    expect(screen.getByText("列表项1")).toBeDefined();
    expect(screen.getByText("列表项2")).toBeDefined();
  });
});
