import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { Input } from "../../../src/components/primitive/input";

describe("Input 组件", () => {
  it("应正确渲染默认输入框", () => {
    render(<Input placeholder="输入内容" />);
    const input = screen.getByPlaceholderText("输入内容");
    expect(input).toBeDefined();
    expect(input.tagName).toBe("INPUT");
  });

  it("应正确应用传入的className", () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("custom-class");
  });

  it("应正确处理不同的输入类型", () => {
    render(<Input type="password" data-testid="input" />);
    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.getAttribute("type")).toBe("password");
  });

  it("应正确处理禁用状态", () => {
    render(<Input disabled data-testid="input" />);
    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("应正确处理无效状态", () => {
    render(<Input aria-invalid={true} data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("应响应用户输入", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "test value" } });
    expect(input.value).toBe("test value");
  });

  it("应正确处理onChange事件", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} data-testid="input" />);
    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "test" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("应正确处理onFocus事件", () => {
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} data-testid="input" />);
    const input = screen.getByTestId("input");

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it("应正确处理onBlur事件", () => {
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} data-testid="input" />);
    const input = screen.getByTestId("input");

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("应正确使用ref", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} data-testid="input" />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("INPUT");
  });

  it("应支持placeholder属性", () => {
    const placeholder = "请输入内容";
    render(<Input placeholder={placeholder} data-testid="input" />);
    const input = screen.getByTestId("input");

    expect(input.getAttribute("placeholder")).toBe(placeholder);
  });

  it("应正确处理readOnly属性", () => {
    render(<Input readOnly data-testid="input" />);
    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.readOnly).toBe(true);
  });

  it("应正确处理默认值", () => {
    const defaultValue = "默认值";
    render(<Input defaultValue={defaultValue} data-testid="input" />);
    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.value).toBe(defaultValue);
  });
});
