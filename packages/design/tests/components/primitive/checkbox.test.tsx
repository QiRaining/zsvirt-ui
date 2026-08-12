import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { Checkbox } from "../../../src/components/primitive/checkbox";

describe("Checkbox 组件", () => {
  it("应正确渲染默认复选框", () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeDefined();
    expect(checkbox.className).toContain("rounded-sm");
  });

  it("应正确应用传入的className", () => {
    render(<Checkbox className="custom-class" data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox.className).toContain("custom-class");
  });

  it("应正确处理选中状态", () => {
    render(<Checkbox defaultChecked data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox.getAttribute("data-state")).toBe("checked");
  });

  it("应正确处理未选中状态", () => {
    render(<Checkbox defaultChecked={false} data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox.getAttribute("data-state")).toBe("unchecked");
  });

  it("应正确处理禁用状态", () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox.hasAttribute("disabled")).toBe(true);
  });

  it("应处理不确定状态", () => {
    render(<Checkbox checked="indeterminate" data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");
    const indeterminateElement = checkbox.querySelector("div");
    expect(indeterminateElement).toBeDefined();
    expect(indeterminateElement?.className).toContain("bg-theme-600");
  });

  it("应正确处理onChange事件", () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("应在禁用时不触发onChange事件", () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        onCheckedChange={handleChange}
        disabled
        data-testid="checkbox"
      />,
    );
    const checkbox = screen.getByTestId("checkbox");

    fireEvent.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("应正确切换选中状态", () => {
    render(<Checkbox defaultChecked={false} data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");

    // 初始未选中
    expect(checkbox.getAttribute("data-state")).toBe("unchecked");

    // 点击选中
    fireEvent.click(checkbox);
    expect(checkbox.getAttribute("data-state")).toBe("checked");

    // 再次点击取消选中
    fireEvent.click(checkbox);
    expect(checkbox.getAttribute("data-state")).toBe("unchecked");
  });

  it("应在受控模式下正确工作", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Checkbox
        checked={false}
        onCheckedChange={handleChange}
        data-testid="checkbox"
      />,
    );

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox.getAttribute("data-state")).toBe("unchecked");

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);

    // 模拟父组件更新checked状态
    rerender(
      <Checkbox
        checked={true}
        onCheckedChange={handleChange}
        data-testid="checkbox"
      />,
    );

    expect(checkbox.getAttribute("data-state")).toBe("checked");
  });

  it("应渲染正确的图标", () => {
    render(<Checkbox defaultChecked data-testid="checkbox" />);
    const checkbox = screen.getByTestId("checkbox");

    // 检查是否渲染了checkmark图标
    const icon = checkbox.querySelector("svg");
    expect(icon).toBeDefined();
  });
});
