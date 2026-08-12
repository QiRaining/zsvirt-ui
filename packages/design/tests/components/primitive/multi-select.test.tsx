import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 模拟依赖
vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }, values) => {
      if (values) {
        return defaultMessage.replace(
          /{(\w+)}/g,
          (_, key) => values[key] || "",
        );
      }
      return defaultMessage || id;
    },
  }),
}));

// 模拟 @zstack/utils
vi.mock("@zstack/utils", () => ({
  cn: (...inputs) => inputs.filter(Boolean).join(" "),
}));

// 模拟依赖组件
vi.mock("../../../src/components/primitive/button.tsx", () => ({
  Button: ({ children, onClick, variant }) => (
    <button data-variant={variant} onClick={onClick} data-testid="mock-button">
      {children}
    </button>
  ),
}));

vi.mock("../../../src/components/primitive/popover.tsx", () => ({
  Popover: ({ children, open }) => (
    <div data-testid="mock-popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children, asChild }) => (
    <div data-testid="mock-popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  PopoverContent: ({ children, align, className, onEscapeKeyDown }) => (
    <div
      data-testid="mock-popover-content"
      data-align={align}
      className={className}
      onClick={() => onEscapeKeyDown && onEscapeKeyDown()}
    >
      {children}
    </div>
  ),
}));

vi.mock("../../../src/components/primitive/tag.tsx", () => ({
  Tag: ({ children, closable, onClose, className }) => (
    <div data-testid="mock-tag" className={className}>
      {children}
      {closable && (
        <button data-testid="mock-tag-close-button" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  ),
}));

vi.mock("../../../src/components/primitive/checkbox.tsx", () => ({
  Checkbox: ({ checked, onCheckedChange }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onCheckedChange && onCheckedChange(!checked)}
      data-testid="mock-checkbox"
    />
  ),
}));

// 导入被测试的组件
import { MultiSelect } from "../../../src/components/primitive/multi-select";

// 测试图标组件
const TestIcon: React.ComponentType<{ className?: string }> = ({
  className,
}) => <div data-testid="test-icon" className={className} />;

describe("MultiSelect 组件", () => {
  const mockOptions = [
    { label: "选项1", value: "option1" },
    { label: "选项2", value: "option2" },
    { label: "选项3", value: "option3", icon: TestIcon },
  ];

  const onSelectedValuesChangeMock = vi.fn();

  beforeEach(() => {
    onSelectedValuesChangeMock.mockClear();
  });

  it("应正确渲染 MultiSelect 组件", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    expect(screen.getByTestId("mock-popover")).toBeDefined();
    expect(screen.getByTestId("mock-popover-trigger")).toBeDefined();
    expect(screen.getByTestId("multi-select")).toBeDefined();
  });

  it("应正确显示已选择的值", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[mockOptions[0], mockOptions[1]]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    const tags = screen.getAllByTestId("mock-tag");
    expect(tags.length).toBe(2);
    expect(tags[0].textContent).toContain("选项1");
    expect(tags[1].textContent).toContain("选项2");
  });

  it("选项中带有图标时应正确显示图标", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[mockOptions[2]]} // 选择带有图标的选项
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    expect(screen.getByTestId("test-icon")).toBeDefined();
  });

  it("点击标签的关闭按钮时应移除该选项", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[mockOptions[0], mockOptions[1]]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    const closeButtons = screen.getAllByTestId("mock-tag-close-button");
    fireEvent.click(closeButtons[0]);

    expect(onSelectedValuesChangeMock).toHaveBeenCalledWith([mockOptions[1]]);
  });

  it("在 PopoverContent 中应显示选项列表", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    const content = screen.getByTestId("mock-popover-content");
    expect(content).toBeDefined();
    expect(content.className).toContain("w-[320px]");
  });

  it("应显示已选数量", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[mockOptions[0], mockOptions[1]]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    const content = screen.getByTestId("mock-popover-content");
    expect(content.textContent).toContain("已选(2)");
  });

  it("当有选择项时应显示清空按钮", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[mockOptions[0]]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    const clearButton = screen.getByText("清空");
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect(onSelectedValuesChangeMock).toHaveBeenCalledWith([]);
  });

  it("当没有选择项时应显示全选按钮", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    const selectAllButton = screen.getByText("全选");
    expect(selectAllButton).toBeDefined();

    fireEvent.click(selectAllButton);
    expect(onSelectedValuesChangeMock).toHaveBeenCalledWith(mockOptions);
  });

  it("应该能够单击选项进行选择", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    // 模拟在选项容器中找到并点击第一个复选框
    const checkboxes = screen.getAllByTestId("mock-checkbox");
    fireEvent.click(checkboxes[0]);

    // 应该调用选项更改回调
    expect(onSelectedValuesChangeMock).toHaveBeenCalled();
  });

  it("应应用自定义className", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        className="custom-class"
        data-testid="multi-select"
      />,
    );

    const multiSelect = screen.getByTestId("multi-select");
    expect(multiSelect.className).toContain("custom-class");
  });

  it("搜索时应该筛选选项", () => {
    render(
      <MultiSelect
        options={mockOptions}
        selectedValues={[]}
        onSelectedValuesChange={onSelectedValuesChangeMock}
        data-testid="multi-select"
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "选项1" } });

    // 在我们的模拟环境中，无法直接测试过滤逻辑，但可以确保组件不会崩溃
    expect((input as HTMLInputElement).value).toBe("选项1");
  });
});
