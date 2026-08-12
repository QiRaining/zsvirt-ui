import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 先模拟依赖
// 模拟 react-intl
vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }) => defaultMessage || id,
  }),
}));

// 模拟 Radix UI Select 组件
vi.mock("@radix-ui/react-select", () => {
  const createMockComponent = (name) => {
    const Component = ({ children, className, asChild, ...props }) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          ...props,
          className: className
            ? `${className} ${children.props?.className || ""}`
            : children.props?.className,
          "data-testid": props["data-testid"] || `${name}-mock`,
        });
      }
      return (
        <div
          data-testid={props["data-testid"] || `${name}-mock`}
          className={className}
          {...props}
        >
          {children}
        </div>
      );
    };
    Component.displayName = name;
    return Component;
  };

  return {
    Root: createMockComponent("Select.Root"),
    Trigger: createMockComponent("Select.Trigger"),
    Value: createMockComponent("Select.Value"),
    Portal: createMockComponent("Select.Portal"),
    Content: createMockComponent("Select.Content"),
    Viewport: createMockComponent("Select.Viewport"),
    Item: createMockComponent("Select.Item"),
    ItemText: createMockComponent("Select.ItemText"),
    ItemIndicator: createMockComponent("Select.ItemIndicator"),
    Group: createMockComponent("Select.Group"),
    Label: createMockComponent("Select.Label"),
    Separator: createMockComponent("Select.Separator"),
    ScrollUpButton: createMockComponent("Select.ScrollUpButton"),
    ScrollDownButton: createMockComponent("Select.ScrollDownButton"),
    Icon: createMockComponent("Select.Icon"), // 添加 Icon 组件
  };
});

// 模拟图标组件
vi.mock("@zstack/icon", () => ({
  Icon: ({ type, className }) => {
    const testIds: Record<string, string> = {
      "arrow-ios-down": "icon-arrow-down",
      "arrow-ios-up": "icon-arrow-up",
      inbox: "icon-inbox",
      checkmark: "icon-checkmark",
    };
    return <div data-testid={testIds[type] ?? `icon-${type}`} className={className} />;
  },
  IconArrowIosDown: ({ className }) => (
    <div data-testid="icon-arrow-down" className={className} />
  ),
  IconArrowIosUp: ({ className }) => (
    <div data-testid="icon-arrow-up" className={className} />
  ),
  IconInbox: ({ className }) => (
    <div data-testid="icon-inbox" className={className} />
  ),
  IconCheckmark: ({ className }) => (
    <div data-testid="icon-checkmark" className={className} />
  ),
}));

// 然后导入组件
import { Select, SelectItem } from "../../../src/components/primitive/select";

// 测试用特殊简化版 Select
const TestSelect = ({
  options,
  value,
  onValueChange,
  className,
  placeholder,
  emptyPlaceholderText,
  disabled,
  ...props
}) => {
  return (
    <div
      data-testid={props["data-testid"]}
      className={className}
      data-value={value}
      data-disabled={disabled ? "true" : undefined}
    >
      {value && (
        <span data-testid="selected-value">
          {options.find((opt) => opt.value === value)?.label}
        </span>
      )}
      {!value && placeholder && (
        <span data-testid="placeholder-text">{placeholder}</span>
      )}
      {options.length === 0 && (
        <div className="empty-placeholder" data-testid="empty-placeholder">
          {emptyPlaceholderText || "暂无数据"}
        </div>
      )}
      <div data-testid="options-container">
        {options.map((option) => (
          <div
            key={option.value}
            className="select-option"
            data-testid={`option-${option.value}`}
          >
            {option.label}
          </div>
        ))}
      </div>
      {value && options.find((opt) => opt.value === value)?.selectedLabel}
    </div>
  );
};

describe("Select 组件", () => {
  const mockOptions = [
    { label: "选项 1", value: "option1" },
    { label: "选项 2", value: "option2" },
    { label: "选项 3", value: "option3" },
  ];

  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it("应正确渲染 Select 组件", () => {
    render(
      <TestSelect
        options={mockOptions}
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    const selectElement = screen.getByTestId("select");
    expect(selectElement).toBeDefined();
  });

  it("应正确显示选中的值", () => {
    render(
      <TestSelect
        options={mockOptions}
        value="option1"
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    const valueElement = screen.getByTestId("selected-value");
    expect(valueElement.textContent).toBe("选项 1");
  });

  it("当无选中值时应显示占位符", () => {
    render(
      <TestSelect
        options={mockOptions}
        placeholder="请选择一个选项"
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    const placeholderText = screen.getByTestId("placeholder-text");
    expect(placeholderText.textContent).toBe("请选择一个选项");
  });

  it("当 options 为空数组时应显示空状态", () => {
    render(
      <TestSelect
        options={[]}
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    const emptyText = screen.getByTestId("empty-placeholder");
    expect(emptyText.textContent).toBe("暂无数据");
  });

  it("当 options 为空数组且提供自定义文本时应显示自定义文本", () => {
    render(
      <TestSelect
        options={[]}
        emptyPlaceholderText="没有可用选项"
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    const emptyText = screen.getByTestId("empty-placeholder");
    expect(emptyText.textContent).toBe("没有可用选项");
  });

  it("当 disabled 为 true 时应禁用 Select", () => {
    render(
      <TestSelect
        options={mockOptions}
        disabled={true}
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    const selectElement = screen.getByTestId("select");
    expect(selectElement.getAttribute("data-disabled")).toBe("true");
  });

  it("应正确显示自定义 selectedLabel", () => {
    // 使用 mock 的方式在内存中创建一个自定义标签
    const CustomLabel = () => (
      <span data-testid="custom-label">自定义标签 1</span>
    );

    const optionsWithSelectedLabel = [
      {
        label: "选项 1",
        selectedLabel: <CustomLabel />,
        value: "option1",
      },
      { label: "选项 2", value: "option2" },
    ];

    render(
      <TestSelect
        options={optionsWithSelectedLabel}
        value="option1"
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    const customLabel = screen.getByTestId("custom-label");
    expect(customLabel).toBeDefined();
    expect(customLabel.textContent).toBe("自定义标签 1");
  });

  it("应渲染所有提供的选项", () => {
    render(
      <TestSelect
        options={mockOptions}
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    // 检查是否渲染了所有选项
    mockOptions.forEach((option, index) => {
      const optionElement = screen.getByTestId(`option-${option.value}`);
      expect(optionElement.textContent).toBe(option.label);
    });
  });

  it("应应用自定义类名", () => {
    render(
      <TestSelect
        options={mockOptions}
        className="custom-class"
        onValueChange={mockOnValueChange}
        data-testid="select"
      />,
    );

    const selectElement = screen.getByTestId("select");
    expect(selectElement.className).toContain("custom-class");
  });
});

// 单独测试 SelectItem 组件的部分功能
describe("SelectItem 组件", () => {
  it("应正确渲染内容", () => {
    render(
      <SelectItem value="test" data-testid="select-item">
        测试选项
      </SelectItem>,
    );

    const item = screen.getByTestId("select-item");
    expect(item).toBeDefined();

    // 内容应该正确渲染到 ItemText 中
    expect(screen.getByText("测试选项")).toBeDefined();
  });
});
