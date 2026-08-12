import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import {
  AutoComplete,
  AutoCompleteOption,
} from "../../../src/components/primitive/auto-complete";

describe("AutoComplete", () => {
  const mockOptions: AutoCompleteOption[] = [
    { value: "apple", label: "苹果" },
    { value: "banana", label: "香蕉" },
    { value: "orange", label: "橙子" },
    { value: "pear", label: "梨" },
    { value: "grape", label: "葡萄" },
  ];

  const setup = (props = {}) => {
    return render(
      <AutoComplete
        options={mockOptions}
        placeholder="请输入水果名称"
        {...props}
      />,
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("应该正确渲染组件", () => {
    setup();
    const input = screen.getByPlaceholderText("请输入水果名称");
    expect(input).toBeInTheDocument();
    expect(screen.queryByText("苹果")).not.toBeInTheDocument();
  });

  it("应该在search模式下，用户输入时显示过滤后的选项", () => {
    setup();
    const input = screen.getByPlaceholderText("请输入水果名称");

    fireEvent.change(input, { target: { value: "苹" } });

    expect(screen.getByText("苹果")).toBeInTheDocument();
    expect(screen.queryByText("香蕉")).not.toBeInTheDocument();
  });

  it("应该在focus模式下，输入框获得焦点时显示所有选项", () => {
    setup({ triggerMode: "focus" });
    const input = screen.getByPlaceholderText("请输入水果名称");

    fireEvent.focus(input);

    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("应该能通过点击选择一个选项", () => {
    const onChangeMock = vi.fn();
    const onSelectMock = vi.fn();

    setup({
      onChange: onChangeMock,
      onSelect: onSelectMock,
    });

    const input = screen.getByPlaceholderText("请输入水果名称");
    fireEvent.change(input, { target: { value: "苹" } });

    const option = screen.getByText("苹果");
    fireEvent.click(option);

    expect(input).toHaveValue("苹果");
    expect(onChangeMock).toHaveBeenCalledWith("苹果");
    expect(onSelectMock).toHaveBeenCalledWith(mockOptions[0]);
    expect(screen.queryByText("苹果")).not.toBeInTheDocument(); // 下拉框应该关闭
  });

  it("应该能通过Escape键关闭下拉框", () => {
    setup();
    const input = screen.getByPlaceholderText("请输入水果名称");

    fireEvent.change(input, { target: { value: "果" } });
    expect(screen.getByText("苹果")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByText("苹果")).not.toBeInTheDocument();
  });

  it("应该在清空输入时清除选中状态并关闭下拉框", () => {
    setup();
    const input = screen.getByPlaceholderText("请输入水果名称");

    // 先选中一个选项
    fireEvent.change(input, { target: { value: "苹" } });
    const option = screen.getByText("苹果");
    fireEvent.click(option);

    // 清空输入
    fireEvent.change(input, { target: { value: "" } });

    // 下拉框应该关闭
    expect(screen.queryByText("苹果")).not.toBeInTheDocument();
  });

  it("应该在点击外部区域时关闭下拉框", () => {
    // 因为组件中使用了document listener，所以需要创建一个外部元素
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <AutoComplete options={mockOptions} placeholder="请输入水果名称" />
      </div>,
    );

    const input = screen.getByPlaceholderText("请输入水果名称");
    const outsideElement = screen.getByTestId("outside-element");

    fireEvent.change(input, { target: { value: "果" } });
    expect(screen.getByText("苹果")).toBeInTheDocument();

    // 点击外部元素
    fireEvent.mouseDown(outsideElement);

    // 下拉框应该关闭
    expect(screen.queryByText("苹果")).not.toBeInTheDocument();
  });

  it("应该在输入无匹配项时不显示下拉框", () => {
    setup();
    const input = screen.getByPlaceholderText("请输入水果名称");

    fireEvent.change(input, { target: { value: "西瓜" } });

    // 没有匹配项，不应该显示下拉框
    mockOptions.forEach((option) => {
      expect(screen.queryByText(option.label)).not.toBeInTheDocument();
    });
  });

  it("应该正确接收初始值", () => {
    setup({ value: "苹果" });
    const input = screen.getByPlaceholderText("请输入水果名称");

    expect(input).toHaveValue("苹果");
  });
});
