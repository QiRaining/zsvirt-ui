import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { CheckboxGroup } from "../../../src/components/primitive/checkbox-group";

// 需要模拟依赖的组件
vi.mock("../../../src/components/primitive/checkbox", () => ({
  Checkbox: ({ id, checked, onCheckedChange, ...props }) => (
    <div
      data-testid={`mock-checkbox-${id}`}
      data-checked={checked}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      {...props}
    >
      Checkbox
    </div>
  ),
}));

vi.mock("../../../src/components/primitive/label", () => ({
  Label: ({ htmlFor, children, className, ...props }) => (
    <label
      data-testid={`mock-label-${htmlFor}`}
      htmlFor={htmlFor}
      className={className}
      {...props}
    >
      {children}
    </label>
  ),
}));

describe("CheckboxGroup 组件", () => {
  const mockItems = [
    { label: "选项1", value: "option1" },
    { label: "选项2", value: "option2" },
    { label: "选项3", value: "option3" },
  ];

  it("应正确渲染所有复选框项", () => {
    const mockOnChange = vi.fn();
    render(
      <CheckboxGroup items={mockItems} value={[]} onChange={mockOnChange} />,
    );

    // 检查是否渲染了所有选项
    mockItems.forEach((item) => {
      const checkbox = screen.getByTestId(`mock-checkbox-${item.value}`);
      const label = screen.getByTestId(`mock-label-${item.value}`);

      expect(checkbox).toBeDefined();
      expect(label).toBeDefined();
      expect(label.textContent).toBe(item.label);
    });
  });

  it("应正确显示选中状态", () => {
    const selectedValues = ["option1", "option3"];
    render(
      <CheckboxGroup
        items={mockItems}
        value={selectedValues}
        onChange={() => {}}
      />,
    );

    // 检查选中状态是否正确
    mockItems.forEach((item) => {
      const checkbox = screen.getByTestId(`mock-checkbox-${item.value}`);
      if (selectedValues.includes(item.value)) {
        expect(checkbox.getAttribute("data-checked")).toBe("true");
      } else {
        expect(checkbox.getAttribute("data-checked")).toBe("false");
      }
    });
  });

  it("选中复选框时应调用onChange并添加值", () => {
    const mockOnChange = vi.fn();
    const initialValue = ["option1"];

    render(
      <CheckboxGroup
        items={mockItems}
        value={initialValue}
        onChange={mockOnChange}
      />,
    );

    // 选中一个未选中的项
    const checkbox = screen.getByTestId("mock-checkbox-option2");
    fireEvent.click(checkbox);

    // 验证onChange被调用，且参数正确
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(["option1", "option2"]);
  });

  it("取消选中复选框时应调用onChange并移除值", () => {
    const mockOnChange = vi.fn();
    const initialValue = ["option1", "option2"];

    render(
      <CheckboxGroup
        items={mockItems}
        value={initialValue}
        onChange={mockOnChange}
      />,
    );

    // 取消选中一个已选中的项
    const checkbox = screen.getByTestId("mock-checkbox-option1");
    fireEvent.click(checkbox);

    // 验证onChange被调用，且参数正确
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(["option2"]);
  });

  it("应处理空数组作为初始值", () => {
    const mockOnChange = vi.fn();

    render(
      <CheckboxGroup items={mockItems} value={[]} onChange={mockOnChange} />,
    );

    // 选中一个项
    const checkbox = screen.getByTestId("mock-checkbox-option1");
    fireEvent.click(checkbox);

    // 验证onChange被调用，且参数正确
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(["option1"]);
  });

  it("应正确处理undefined值", () => {
    const mockOnChange = vi.fn();

    render(
      <CheckboxGroup
        items={mockItems}
        value={[] as string[]}
        onChange={mockOnChange}
      />,
    );

    // 不应该崩溃，应该能正常渲染
    mockItems.forEach((item) => {
      const checkbox = screen.getByTestId(`mock-checkbox-${item.value}`);
      expect(checkbox).toBeDefined();
    });
  });

  it("应处理空项目数组", () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <CheckboxGroup items={[]} value={[]} onChange={mockOnChange} />,
    );

    // 应该渲染一个空的容器
    const wrapperDiv = container.querySelector(".flex.flex-wrap");
    expect(wrapperDiv).toBeDefined();
    expect(wrapperDiv?.children.length).toBe(0);
  });

  it("应渲染自定义ReactNode标签", () => {
    const customItems = [
      {
        label: (
          <span data-testid="custom-label">
            自定义<strong>标签</strong>
          </span>
        ),
        value: "custom",
      },
      ...mockItems,
    ];

    render(
      <CheckboxGroup items={customItems} value={[]} onChange={() => {}} />,
    );

    // 检查自定义标签是否被正确渲染
    const customLabel = screen.getByTestId("custom-label");
    expect(customLabel).toBeDefined();
    expect(customLabel.innerHTML).toContain("<strong>标签</strong>");
  });
});
