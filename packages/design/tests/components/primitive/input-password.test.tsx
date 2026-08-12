import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { InputPassword } from "../../../src/components/primitive/input-password";

describe("InputPassword 组件", () => {
  it("应正确渲染密码输入框", () => {
    render(<InputPassword data-testid="password-input" />);

    const input = screen.getByTestId("password-input");
    expect(input).toBeDefined();
    expect(input.tagName).toBe("INPUT");
    expect((input as HTMLInputElement).type).toBe("password");
  });

  it("应默认隐藏密码文本", () => {
    render(
      <InputPassword defaultValue="password123" data-testid="password-input" />,
    );

    const input = screen.getByTestId("password-input");
    expect((input as HTMLInputElement).type).toBe("password");
  });

  it("应允许切换密码可见性", () => {
    const { container } = render(
      <InputPassword data-testid="password-input" />,
    );

    const input = screen.getByTestId("password-input");
    expect((input as HTMLInputElement).type).toBe("password");

    // 查找切换可见性的图标按钮
    const toggleButton = container.querySelector("span.absolute");
    expect(toggleButton).not.toBeNull();

    // 点击切换按钮
    fireEvent.click(toggleButton!);

    // 验证类型切换到text
    expect((input as HTMLInputElement).type).toBe("text");

    // 再次点击
    fireEvent.click(toggleButton!);

    // 验证类型切换回password
    expect((input as HTMLInputElement).type).toBe("password");
  });

  it("应在禁用时不允许切换密码可见性", () => {
    const { container } = render(
      <InputPassword disabled data-testid="password-input" />,
    );

    const input = screen.getByTestId("password-input");
    expect((input as HTMLInputElement).disabled).toBe(true);
    expect((input as HTMLInputElement).type).toBe("password");

    // 查找切换可见性的图标按钮
    const toggleButton = container.querySelector("span.absolute");
    expect(toggleButton).not.toBeNull();
    expect(toggleButton?.className).toContain("cursor-not-allowed");

    // 尝试点击切换按钮
    fireEvent.click(toggleButton!);

    // 验证类型未变化
    expect((input as HTMLInputElement).type).toBe("password");
  });

  it("应支持自定义图标渲染", () => {
    const customIconRender = vi.fn((visible) => (
      <div data-testid="custom-icon">{visible ? "Visible" : "Hidden"}</div>
    ));

    const { container } = render(
      <InputPassword
        iconRender={customIconRender}
        data-testid="password-input"
      />,
    );

    // 验证自定义图标被渲染
    const customIcon = screen.getByTestId("custom-icon");
    expect(customIcon).toBeDefined();
    expect(customIcon.textContent).toBe("Hidden");

    // 切换可见性
    const toggleButton = container.querySelector("span.absolute");
    fireEvent.click(toggleButton!);

    // 验证图标内容变化
    expect(customIcon.textContent).toBe("Visible");

    // 验证自定义渲染函数被调用两次
    expect(customIconRender).toHaveBeenCalledTimes(2);
  });

  it("应可以关闭可见性切换按钮", () => {
    const { container } = render(
      <InputPassword visibilityToggle={false} data-testid="password-input" />,
    );

    // 验证切换按钮不存在
    const toggleButton = container.querySelector("span.absolute");
    expect(toggleButton).toBeNull();
  });

  it("应在密码可见时使用正常字间距", () => {
    const { container } = render(
      <InputPassword defaultValue="password123" data-testid="password-input" />,
    );

    const input = screen.getByTestId("password-input");
    expect(input.className).toContain(
      "[&:not(:placeholder-shown)]:tracking-widest",
    );

    // 切换到可见状态
    const toggleButton = container.querySelector("span.absolute");
    fireEvent.click(toggleButton!);

    // 验证使用正常字间距
    expect(input.className).toContain("tracking-normal");
  });

  it("应正确处理密码输入", () => {
    const handleChange = vi.fn();
    render(
      <InputPassword onChange={handleChange} data-testid="password-input" />,
    );

    const input = screen.getByTestId("password-input");
    fireEvent.change(input, { target: { value: "newpassword" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).value).toBe("newpassword");
  });

  it("应正确应用传入的className", () => {
    render(
      <InputPassword className="custom-class" data-testid="password-input" />,
    );

    const input = screen.getByTestId("password-input");
    expect(input.className).toContain("custom-class");
  });

  it("应传递其他props到Input组件", () => {
    render(
      <InputPassword
        placeholder="请输入密码"
        autoComplete="off"
        data-testid="password-input"
      />,
    );

    const input = screen.getByTestId("password-input");
    expect(input.getAttribute("placeholder")).toBe("请输入密码");
    expect(input.getAttribute("autocomplete")).toBe("off");
  });

  it("应正确处理默认属性", () => {
    const { container } = render(
      <InputPassword data-testid="password-input" />,
    );

    // 验证默认显示切换按钮
    const toggleButton = container.querySelector("span.absolute");
    expect(toggleButton).not.toBeNull();
  });
});
