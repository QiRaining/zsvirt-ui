import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { Switch } from "../../../src/components/primitive/switch";

// 模拟 Radix UI Switch 组件
vi.mock("@radix-ui/react-switch", () => {
  return {
    Root: function Root({
      children,
      className,
      checked,
      onCheckedChange,
      disabled,
      ...props
    }) {
      return (
        <div
          role="switch"
          aria-checked={checked}
          data-state={checked ? "checked" : "unchecked"}
          data-disabled={disabled ? "true" : undefined}
          className={className}
          onClick={() => {
            if (!disabled && onCheckedChange) {
              onCheckedChange(!checked);
            }
          }}
          {...props}
        >
          {children}
        </div>
      );
    },

    Thumb: function Thumb({ className }) {
      return <span data-testid="switch-thumb" className={className} />;
    },
  };
});

// 模拟图标组件
vi.mock("@zstack/icon", () => ({
  Icon: function Icon({ type, className }) {
    return (
      <div
        data-testid={type === "checkmark" ? "icon-checkmark" : "icon-close"}
        className={className}
      />
    );
  },
  IconCheckmark: function IconCheckmark({ className }) {
    return <div data-testid="icon-checkmark" className={className} />;
  },
  IconClose: function IconClose({ className }) {
    return <div data-testid="icon-close" className={className} />;
  },
}));

describe("Switch 组件", () => {
  it("应正确渲染开关组件", () => {
    render(<Switch data-testid="switch" />);

    const switchElement = screen.getByTestId("switch");
    expect(switchElement).toBeDefined();
    expect(switchElement.getAttribute("role")).toBe("switch");
  });

  it("应正确应用自定义className", () => {
    render(<Switch className="custom-class" data-testid="switch" />);

    const switchElement = screen.getByTestId("switch");
    expect(switchElement.className).toContain("custom-class");
  });

  it("应渲染勾选和关闭图标", () => {
    render(<Switch data-testid="switch" />);

    const checkmarkIcon = screen.getByTestId("icon-checkmark");
    const closeIcon = screen.getByTestId("icon-close");

    expect(checkmarkIcon).toBeDefined();
    expect(closeIcon).toBeDefined();
    expect(checkmarkIcon.className).toContain("left-[3px]");
    expect(closeIcon.className).toContain("right-[3px]");
  });

  it("应渲染滑块", () => {
    render(<Switch data-testid="switch" />);

    const thumb = screen.getByTestId("switch-thumb");
    expect(thumb).toBeDefined();
    expect(thumb.className).toContain("rounded-full");
    expect(thumb.className).toContain("bg-neutral-0");
  });

  it("应正确处理开关的选中状态", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        checked={true}
        onCheckedChange={onCheckedChange}
        data-testid="switch"
      />,
    );

    const switchElement = screen.getByTestId("switch");
    expect(switchElement.getAttribute("aria-checked")).toBe("true");
    expect(switchElement.getAttribute("data-state")).toBe("checked");

    // 点击切换状态
    fireEvent.click(switchElement);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("应正确处理未选中状态", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        data-testid="switch"
      />,
    );

    const switchElement = screen.getByTestId("switch");
    expect(switchElement.getAttribute("aria-checked")).toBe("false");
    expect(switchElement.getAttribute("data-state")).toBe("unchecked");

    // 点击切换状态
    fireEvent.click(switchElement);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("禁用状态下应禁止点击", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        disabled
        checked={false}
        onCheckedChange={onCheckedChange}
        data-testid="switch"
      />,
    );

    const switchElement = screen.getByTestId("switch");
    expect(switchElement.getAttribute("data-disabled")).toBe("true");

    // 禁用状态下点击
    fireEvent.click(switchElement);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("应正确应用样式", () => {
    render(<Switch data-testid="switch" />);

    const switchElement = screen.getByTestId("switch");

    // 检查基本样式
    expect(switchElement.className).toContain("h-[16px]");
    expect(switchElement.className).toContain("w-[32px]");
    expect(switchElement.className).toContain("rounded-full");
    expect(switchElement.className).toContain("cursor-pointer");

    // 检查状态样式
    expect(switchElement.className).toContain(
      "data-[state=checked]:bg-color-600",
    );
    expect(switchElement.className).toContain(
      "data-[state=unchecked]:bg-neutral-400",
    );
  });

  it("应正确传递其他属性", () => {
    render(
      <Switch data-testid="switch" aria-label="测试开关" name="test-switch" />,
    );

    const switchElement = screen.getByTestId("switch");
    expect(switchElement.getAttribute("aria-label")).toBe("测试开关");
    expect(switchElement.getAttribute("name")).toBe("test-switch");
  });
});
