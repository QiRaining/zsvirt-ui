import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupRoot,
} from "../../../src/components/primitive/radio-group";
import { RadioOption } from "../../../src/components/primitive/radio-group";

// 模拟ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 全局模拟ResizeObserver
global.ResizeObserver = ResizeObserverMock;

// 模拟Tooltip组件
vi.mock("../../../src/components/primitive/tooltip", () => ({
  Tooltip: ({ children, title }) => (
    <div data-testid="tooltip" data-title={title}>
      {children}
    </div>
  ),
}));

// 模拟Icon组件
vi.mock("@zstack/icon", () => ({
  Icon: ({ type, className }) => (
    <span data-testid={`icon-${type}`} className={className}>
      {type}
    </span>
  ),
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

describe("RadioGroup组件", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 基础选项数据
  const basicOptions: RadioOption[] = [
    { value: "option1", label: "选项1" },
    { value: "option2", label: "选项2" },
    { value: "option3", label: "选项3", disabled: true },
  ];

  // 带提示的选项数据
  const tooltipOptions: RadioOption[] = [
    { value: "option1", label: "选项1", tooltip: "提示1" },
    { value: "option2", label: "选项2", tooltip: "提示2" },
  ];

  // 测试基本渲染
  it("应正确渲染basic风格的RadioGroup组件", () => {
    render(<RadioGroup options={basicOptions} />);

    // 验证所有选项都被渲染
    expect(screen.getByText("选项1")).toBeTruthy();
    expect(screen.getByText("选项2")).toBeTruthy();
    expect(screen.getByText("选项3")).toBeTruthy();

    // 验证禁用状态
    const disabledOption = screen.getByText("选项3").closest("label");
    expect(disabledOption?.getAttribute("data-disabled")).toBe("true");
  });

  // 测试button风格渲染
  it("应正确渲染button风格的RadioGroup组件", () => {
    render(<RadioGroup options={basicOptions} variant="button" />);

    // 验证所有选项都被渲染
    expect(screen.getByText("选项1")).toBeTruthy();
    expect(screen.getByText("选项2")).toBeTruthy();
    expect(screen.getByText("选项3")).toBeTruthy();
  });

  // 测试outline风格渲染
  it("应正确渲染outline风格的RadioGroup组件", () => {
    render(<RadioGroup options={basicOptions} variant="outline" />);

    // 验证所有选项都被渲染
    expect(screen.getByText("选项1")).toBeTruthy();
    expect(screen.getByText("选项2")).toBeTruthy();
    expect(screen.getByText("选项3")).toBeTruthy();
  });

  // 测试选择功能
  it("点击选项应该触发onChange回调", () => {
    const handleChange = vi.fn();

    render(<RadioGroup options={basicOptions} onValueChange={handleChange} />);

    // 点击第二个选项
    fireEvent.click(screen.getByText("选项2"));

    // 验证回调被调用，且参数正确
    expect(handleChange).toHaveBeenCalledWith("option2");
  });

  // 测试禁用项点击
  it("点击禁用选项不应触发onChange回调", () => {
    const handleChange = vi.fn();

    render(<RadioGroup options={basicOptions} onValueChange={handleChange} />);

    // 点击被禁用的选项
    fireEvent.click(screen.getByText("选项3"));

    // 验证回调未被调用
    expect(handleChange).not.toHaveBeenCalled();
  });

  // 测试初始选中值
  it("应正确渲染初始选中值", () => {
    render(<RadioGroup options={basicOptions} defaultValue="option2" />);

    // 获取所有RadioGroupItem元素
    const radioItems = document.querySelectorAll("[role='radio']");

    // 验证第二个选项被选中
    const option2 = Array.from(radioItems).find(
      (item) => item.id === "option2",
    );
    expect(option2?.getAttribute("data-state")).toBe("checked");
  });

  // 测试受控组件模式
  it("应支持受控组件模式", () => {
    const { rerender } = render(
      <RadioGroup options={basicOptions} value="option1" />,
    );

    // 获取所有RadioGroupItem元素
    let radioItems = document.querySelectorAll("[role='radio']");

    // 验证第一个选项被选中
    const option1 = Array.from(radioItems).find(
      (item) => item.id === "option1",
    );
    expect(option1?.getAttribute("data-state")).toBe("checked");

    // 重新渲染，改变选中值
    rerender(<RadioGroup options={basicOptions} value="option2" />);

    // 重新获取元素
    radioItems = document.querySelectorAll("[role='radio']");

    // 验证第二个选项被选中
    const option2 = Array.from(radioItems).find(
      (item) => item.id === "option2",
    );
    expect(option2?.getAttribute("data-state")).toBe("checked");
  });

  // 测试带提示的选项
  it("带有tooltip属性的选项应正确渲染提示", () => {
    render(<RadioGroup options={tooltipOptions} />);

    // 验证tooltip是否被正确渲染
    const tooltips = screen.getAllByTestId("tooltip");
    expect(tooltips.length).toBe(2);
    expect(tooltips[0].getAttribute("data-title")).toBe("提示1");
    expect(tooltips[1].getAttribute("data-title")).toBe("提示2");
  });

  // 测试图标渲染
  it("应正确渲染不同状态的图标", () => {
    render(<RadioGroup options={basicOptions} value="option1" />);

    // 验证选中状态图标
    expect(screen.getAllByTestId("icon-radio-button-on-fill").length).toBe(1);

    // 验证未选中状态图标
    expect(screen.getAllByTestId("icon-radio-button-off").length).toBe(2);

    // 验证禁用状态图标
    expect(screen.getAllByTestId("icon-radio-button-off-disabled").length).toBe(
      1,
    );
  });

  // 测试组件的公共API
  it("应正确导出所有组件", () => {
    expect(RadioGroup).toBeDefined();
    expect(RadioGroupItem).toBeDefined();
    expect(RadioGroupRoot).toBeDefined();
  });

  // 测试自定义className
  it("应支持自定义className", () => {
    render(
      <RadioGroup options={basicOptions} className="custom-radio-group" />,
    );

    // 验证自定义类名是否被应用
    const radioGroup = document.querySelector("div[role='radiogroup']");
    expect(radioGroup?.classList.contains("custom-radio-group")).toBe(true);
  });
});
