import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { InputNumber } from "../../../src/components/primitive/input-number";

describe("InputNumber 组件", () => {
  it("应正确渲染数字输入框", () => {
    const handleValueChange = vi.fn();
    render(
      <InputNumber
        value={5}
        onValueChange={handleValueChange}
        data-testid="number-input"
      />,
    );

    const input = screen.getByTestId("number-input");
    expect(input).toBeDefined();
    expect(input.tagName).toBe("INPUT");
    expect((input as HTMLInputElement).value).toBe("5");
  });

  it("应正确处理值变更", () => {
    const handleValueChange = vi.fn();
    render(
      <InputNumber
        value={5}
        onValueChange={handleValueChange}
        data-testid="number-input"
      />,
    );

    const input = screen.getByTestId("number-input");
    fireEvent.change(input, { target: { value: "10" } });

    expect(handleValueChange).toHaveBeenCalledTimes(1);
    expect(handleValueChange).toHaveBeenCalledWith(10);
  });

  it("应正确处理非法输入", () => {
    const handleValueChange = vi.fn();
    render(
      <InputNumber
        value={5}
        onValueChange={handleValueChange}
        data-testid="number-input"
      />,
    );

    const input = screen.getByTestId("number-input");

    // 测试非数字输入
    fireEvent.change(input, { target: { value: "abc" } });
    expect(handleValueChange).toHaveBeenCalledWith("");

    // 清空处理函数的调用记录
    handleValueChange.mockClear();

    // 测试空字符串
    fireEvent.change(input, { target: { value: "" } });
    expect(handleValueChange).toHaveBeenCalledWith("");
  });

  it("应支持小数点输入", () => {
    const handleValueChange = vi.fn();
    render(
      <InputNumber
        value={5}
        onValueChange={handleValueChange}
        data-testid="number-input"
      />,
    );

    const input = screen.getByTestId("number-input");

    // 测试小数点输入
    fireEvent.change(input, { target: { value: "5." } });
    expect(handleValueChange).toHaveBeenCalledWith("5.");

    // 清空处理函数的调用记录
    handleValueChange.mockClear();

    // 测试小数点后输入数字
    fireEvent.change(input, { target: { value: "5.5" } });
    expect(handleValueChange).toHaveBeenCalledWith(5.5);
  });

  it("应正确使用上下控制按钮", () => {
    const handleValueChange = vi.fn();
    const { container } = render(
      <InputNumber
        value={5}
        onValueChange={handleValueChange}
        data-testid="number-input"
      />,
    );

    // 使用CSS选择器查找上下箭头按钮
    const upArrowSpan = container.querySelector(".h-\\[50\\%\\]:first-child");
    const downArrowSpan = container.querySelector(".h-\\[50\\%\\]:last-child");

    expect(upArrowSpan).not.toBeNull();
    expect(downArrowSpan).not.toBeNull();

    // 测试点击上箭头
    fireEvent.click(upArrowSpan!);
    expect(handleValueChange).toHaveBeenCalledWith(6);

    // 清空处理函数的调用记录
    handleValueChange.mockClear();

    // 测试点击下箭头
    fireEvent.click(downArrowSpan!);
    expect(handleValueChange).toHaveBeenCalledWith(4);
  });

  it("应遵循最大和最小值限制", () => {
    const handleValueChange = vi.fn();
    let container = render(
      <InputNumber
        value={9}
        onValueChange={handleValueChange}
        max={10}
        min={1}
        data-testid="number-input"
      />,
    ).container;

    // 查找上箭头按钮
    const upArrowSpan = container.querySelector(".h-\\[50\\%\\]:first-child");

    expect(upArrowSpan).not.toBeNull();

    // 测试点击上箭头到最大值
    fireEvent.click(upArrowSpan!);
    expect(handleValueChange).toHaveBeenLastCalledWith(10);

    // 清空处理函数的调用记录
    handleValueChange.mockClear();

    // 测试超过最大值
    fireEvent.click(upArrowSpan!);
    expect(handleValueChange).toHaveBeenLastCalledWith(10);

    // 重置值为最小值临界点
    handleValueChange.mockClear();

    container = render(
      <InputNumber
        value={2}
        onValueChange={handleValueChange}
        max={10}
        min={1}
        data-testid="number-input"
      />,
    ).container;

    // 查找下箭头按钮
    const downArrowSpan = container.querySelector(".h-\\[50\\%\\]:last-child");

    expect(downArrowSpan).not.toBeNull();

    // 测试点击下箭头到最小值
    fireEvent.click(downArrowSpan!);
    expect(handleValueChange).toHaveBeenLastCalledWith(1);

    // 清空处理函数的调用记录
    handleValueChange.mockClear();

    // 测试低于最小值
    fireEvent.click(downArrowSpan!);
    expect(handleValueChange).toHaveBeenLastCalledWith(1);
  });

  it("应支持自定义步长", () => {
    const handleValueChange = vi.fn();
    const { container } = render(
      <InputNumber
        value={5}
        onValueChange={handleValueChange}
        step={0.5}
        data-testid="number-input"
      />,
    );

    // 查找上箭头按钮
    const upArrowSpan = container.querySelector(".h-\\[50\\%\\]:first-child");

    expect(upArrowSpan).not.toBeNull();

    // 测试自定义步长
    fireEvent.click(upArrowSpan!);
    expect(handleValueChange).toHaveBeenCalledWith(5.5);
  });

  it("应响应键盘箭头键", () => {
    const handleValueChange = vi.fn();
    render(
      <InputNumber
        value={5}
        onValueChange={handleValueChange}
        data-testid="number-input"
      />,
    );

    const input = screen.getByTestId("number-input");

    // 测试按下向上箭头键
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(handleValueChange).toHaveBeenCalledWith(6);

    // 清空处理函数的调用记录
    handleValueChange.mockClear();

    // 测试按下向下箭头键
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(handleValueChange).toHaveBeenCalledWith(4);
  });

  it("应处理空字符串值", () => {
    const handleValueChange = vi.fn();
    const { container } = render(
      <InputNumber
        value={""}
        onValueChange={handleValueChange}
        min={1}
        data-testid="number-input"
      />,
    );

    // 查找上箭头按钮
    const upArrowSpan = container.querySelector(".h-\\[50\\%\\]:first-child");

    expect(upArrowSpan).not.toBeNull();

    // 测试空值时点击上箭头
    fireEvent.click(upArrowSpan!);
    expect(handleValueChange).toHaveBeenCalledWith(1);
  });

  it("应支持关闭控制按钮", () => {
    const handleValueChange = vi.fn();
    const { container } = render(
      <InputNumber
        value={5}
        onValueChange={handleValueChange}
        controls={false}
        data-testid="number-input"
      />,
    );

    // 验证没有控制按钮
    const upArrowSpan = container.querySelector(".h-\\[50\\%\\]:first-child");
    expect(upArrowSpan).toBeNull();
  });

  it("应正确处理和传递className", () => {
    render(
      <InputNumber
        value={5}
        onValueChange={() => {}}
        className="custom-class"
        data-testid="number-input"
      />,
    );

    const input = screen.getByTestId("number-input");
    expect(input.className).toContain("custom-class");
  });

  it("应正确处理和传递其他HTML属性", () => {
    render(
      <InputNumber
        value={5}
        onValueChange={() => {}}
        placeholder="请输入数字"
        disabled
        data-testid="number-input"
      />,
    );

    const input = screen.getByTestId("number-input") as HTMLInputElement;
    expect(input.getAttribute("placeholder")).toBe("请输入数字");
    expect(input.disabled).toBe(true);
  });
});
