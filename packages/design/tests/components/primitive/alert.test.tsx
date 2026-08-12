import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { Alert } from "../../../src/components/primitive/alert";

// 模拟图标组件
vi.mock("@zstack/icon", () => ({
  Icon: ({ type, className, onClick }) => (
    <span
      data-testid={`icon-${type}`}
      className={className}
      onClick={onClick}
    ></span>
  ),
  IconAlertTriangleFill: ({ className }) => (
    <span data-testid="icon-alert-triangle-fill" className={className}></span>
  ),
  IconInfoFill: ({ className }) => (
    <span data-testid="icon-info-fill" className={className}></span>
  ),
  IconClose: ({ className, onClick }) => (
    <span
      data-testid="icon-close"
      className={className}
      onClick={onClick}
    ></span>
  ),
}));

describe("Alert组件", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 测试基本渲染
  it("应正确渲染基础Alert组件", () => {
    render(<Alert>这是一条提示信息</Alert>);

    // 检查文本内容
    expect(screen.getByText("这是一条提示信息")).toBeTruthy();

    // 默认情况下应该使用info图标
    expect(screen.getByTestId("icon-info-fill")).toBeTruthy();
  });

  // 测试不同的variant
  it("渲染不同variant时应显示相应图标和样式", () => {
    // 测试info
    const { unmount, container: infoContainer } = render(
      <Alert variant="info">信息提示</Alert>,
    );
    expect(screen.getByTestId("icon-info-fill")).toBeTruthy();
    expect((infoContainer.firstChild as HTMLElement).className).toContain(
      "bg-info-50",
    );
    unmount();

    // 测试warning
    const { unmount: unmountWarning, container: warningContainer } = render(
      <Alert variant="warning">警告提示</Alert>,
    );
    expect(screen.getByTestId("icon-alert-triangle-fill")).toBeTruthy();
    expect((warningContainer.firstChild as HTMLElement).className).toContain(
      "bg-alert-50",
    );
    unmountWarning();

    // 测试danger
    const { container: dangerContainer } = render(
      <Alert variant="danger">错误提示</Alert>,
    );
    expect(screen.getByTestId("icon-alert-triangle-fill")).toBeTruthy();
    expect((dangerContainer.firstChild as HTMLElement).className).toContain(
      "bg-danger-50",
    );
  });

  // 测试可关闭的Alert
  it("设置closable时应显示关闭按钮", () => {
    render(<Alert closable>可关闭的提示</Alert>);

    // 检查是否有关闭图标
    expect(screen.getByTestId("icon-close")).toBeTruthy();
  });

  // 测试关闭功能
  it("点击关闭按钮时应隐藏Alert", () => {
    render(<Alert closable>可关闭的提示</Alert>);

    // 点击关闭按钮
    fireEvent.click(screen.getByTestId("icon-close"));

    // 验证Alert不再可见
    expect(screen.queryByText("可关闭的提示")).toBeNull();
  });

  // 测试自定义类名
  it("应支持自定义className", () => {
    const { container } = render(
      <Alert className="custom-alert">自定义样式的提示</Alert>,
    );

    // 验证自定义类被应用
    expect((container.firstChild as HTMLElement).className).toContain(
      "custom-alert",
    );
  });

  // 测试复杂内容
  it("应支持显示复杂的内容结构", () => {
    render(
      <Alert>
        <h3>标题</h3>
        <p>段落内容</p>
        <ul>
          <li>列表项1</li>
          <li>列表项2</li>
        </ul>
      </Alert>,
    );

    // 检查是否正确渲染所有内容
    expect(screen.getByText("标题")).toBeTruthy();
    expect(screen.getByText("段落内容")).toBeTruthy();
    expect(screen.getByText("列表项1")).toBeTruthy();
    expect(screen.getByText("列表项2")).toBeTruthy();
  });

  // 测试当variant为warning时的图标颜色
  it("variant为warning时应有正确的图标颜色样式", () => {
    render(<Alert variant="warning">警告提示</Alert>);

    const icon = screen.getByTestId("icon-alert-triangle-fill");
    expect(icon.className).toContain("text-alert-500");
  });

  // 测试当variant为danger时的图标颜色
  it("variant为danger时应有正确的图标颜色样式", () => {
    render(<Alert variant="danger">错误提示</Alert>);

    const icon = screen.getByTestId("icon-alert-triangle-fill");
    expect(icon.className).toContain("text-danger-500");
  });

  // 测试当variant为info时的图标颜色
  it("variant为info时应有正确的图标颜色样式", () => {
    render(<Alert variant="info">信息提示</Alert>);

    const icon = screen.getByTestId("icon-info-fill");
    expect(icon.className).toContain("text-info-500");
  });

  // 测试关闭按钮的样式
  it("关闭按钮应有正确的样式", () => {
    // 测试info样式关闭按钮
    const { unmount } = render(
      <Alert closable variant="info">
        信息提示
      </Alert>,
    );
    expect(screen.getByTestId("icon-close").className).toContain(
      "text-info-500",
    );
    unmount();

    // 测试warning样式关闭按钮
    const { unmount: unmountWarning } = render(
      <Alert closable variant="warning">
        警告提示
      </Alert>,
    );
    expect(screen.getByTestId("icon-close").className).toContain(
      "text-alert-500",
    );
    unmountWarning();

    // 测试danger样式关闭按钮
    render(
      <Alert closable variant="danger">
        错误提示
      </Alert>,
    );
    expect(screen.getByTestId("icon-close").className).toContain(
      "text-danger-500",
    );
  });

  // 测试关闭后的状态
  it("关闭后应返回null", () => {
    const { container } = render(<Alert closable>可关闭的提示</Alert>);

    // 点击关闭按钮
    fireEvent.click(screen.getByTestId("icon-close"));

    // 验证组件已被移除
    expect(container.firstChild).toBeNull();
  });
});
