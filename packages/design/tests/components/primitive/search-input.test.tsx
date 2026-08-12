import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { SearchInput } from "../../../src/components/primitive/search-input";

// 模拟图标组件
vi.mock("@zstack/icon", () => ({
  Icon: ({
    type,
    className,
    onClick,
  }: {
    type: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <span
      data-testid={`icon-${type}`}
      className={className}
      onClick={onClick}
    ></span>
  ),
  IconSearch: ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <span
      data-testid="icon-search"
      className={className}
      onClick={onClick}
    ></span>
  ),
  IconCloseCircleFill: ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <span
      data-testid="icon-close-circle-fill"
      className={className}
      onClick={onClick}
    ></span>
  ),
}));

// 模拟Input组件
vi.mock("../../../src/components/primitive/input.tsx", () => {
  const MockInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
  >(({ className, value, onChange, onKeyDown, type, ...props }, ref) => (
    <input
      data-testid="input"
      ref={ref}
      className={className}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      type={type}
      {...props}
    />
  ));
  MockInput.displayName = "Input";

  return { Input: MockInput };
});

describe("SearchInput组件", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 测试基本渲染
  it("应正确渲染SearchInput组件", () => {
    render(<SearchInput placeholder="搜索..." />);

    // 检查输入框是否渲染
    expect(screen.getByTestId("input")).toBeTruthy();
    // 检查搜索图标是否渲染
    expect(screen.getByTestId("icon-search")).toBeTruthy();
    // 检查清除图标未渲染（因为输入框为空）
    expect(screen.queryByTestId("icon-close-circle-fill")).toBeNull();
  });

  // 测试输入行为
  it("输入文本时应更新输入框值并显示清除按钮", () => {
    render(<SearchInput placeholder="搜索..." />);

    const input = screen.getByTestId("input");

    // 输入文本
    fireEvent.change(input, { target: { value: "测试文本" } });

    // 验证输入框的值已更新
    expect((input as HTMLInputElement).value).toBe("测试文本");

    // 验证清除按钮已显示
    expect(screen.getByTestId("icon-close-circle-fill")).toBeTruthy();
  });

  // 测试清除功能
  it("点击清除按钮应清空输入框并触发onClear回调", () => {
    const onClearMock = vi.fn();

    render(
      <SearchInput
        placeholder="搜索..."
        onClear={onClearMock}
        value="初始文本"
      />,
    );

    // 确认清除按钮已显示
    const clearButton = screen.getByTestId("icon-close-circle-fill");
    expect(clearButton).toBeTruthy();

    // 点击清除按钮
    fireEvent.click(clearButton);

    // 验证输入框已清空
    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe("");

    // 验证onClear回调被调用
    expect(onClearMock).toHaveBeenCalledTimes(1);
  });

  // 测试搜索功能 - 点击搜索图标
  it("点击搜索图标应触发onSearch回调", () => {
    const onSearchMock = vi.fn();

    render(
      <SearchInput
        placeholder="搜索..."
        onSearch={onSearchMock}
        value="搜索关键词"
      />,
    );

    // 点击搜索图标
    fireEvent.click(screen.getByTestId("icon-search"));

    // 验证onSearch回调被调用，并传递了正确的参数
    expect(onSearchMock).toHaveBeenCalledWith("搜索关键词");
  });

  // 测试搜索功能 - 按下回车键
  it("按下回车键应触发onSearch回调", () => {
    const onSearchMock = vi.fn();

    render(
      <SearchInput
        placeholder="搜索..."
        onSearch={onSearchMock}
        value="搜索关键词"
      />,
    );

    // 按下回车键
    fireEvent.keyDown(screen.getByTestId("input"), { key: "Enter" });

    // 验证onSearch回调被调用，并传递了正确的参数
    expect(onSearchMock).toHaveBeenCalledWith("搜索关键词");
  });

  // 测试受控组件行为
  it("作为受控组件时应正确更新值", () => {
    const onChangeMock = vi.fn();
    const { rerender } = render(
      <SearchInput
        placeholder="搜索..."
        value="初始值"
        onChange={onChangeMock}
      />,
    );

    // 验证初始值
    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe(
      "初始值",
    );

    // 用户输入
    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "新值" },
    });

    // 验证onChange被调用
    expect(onChangeMock).toHaveBeenCalled();

    // 重新渲染组件，模拟父组件更新值
    rerender(
      <SearchInput
        placeholder="搜索..."
        value="更新的值"
        onChange={onChangeMock}
      />,
    );

    // 验证值被正确更新
    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe(
      "更新的值",
    );
  });

  // 测试props传递
  it("应将其他props正确传递给Input组件", () => {
    render(<SearchInput placeholder="自定义占位符" disabled={true} />);

    const input = screen.getByTestId("input");
    expect(input.getAttribute("placeholder")).toBe("自定义占位符");
    expect(input.hasAttribute("disabled")).toBe(true);
  });

  // 测试无值时的行为
  it("当value为undefined时应将输入框值设为空字符串", () => {
    render(<SearchInput />);

    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe("");
  });

  // 测试useEffect依赖更新
  it("当外部value改变时应更新内部状态", () => {
    const { rerender } = render(<SearchInput value="初始值" />);

    // 验证初始值
    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe(
      "初始值",
    );

    // 重新渲染，value为undefined
    rerender(<SearchInput value={undefined} />);

    // 验证值被更新为空字符串
    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe("");

    // 再次更新value
    rerender(<SearchInput value="新值" />);

    // 验证值被正确更新
    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe(
      "新值",
    );
  });
});
