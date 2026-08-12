import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { Textarea } from "../../../src/components/primitive/textarea";

describe("Textarea 组件", () => {
  it("应正确渲染文本区域", () => {
    render(
      <Textarea value="测试内容" onChange={() => {}} data-testid="textarea" />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeDefined();
    expect(textarea.tagName).toBe("TEXTAREA");
    expect((textarea as HTMLTextAreaElement).value).toBe("测试内容");
  });

  it("应正确应用className", () => {
    render(
      <Textarea
        value="测试内容"
        onChange={() => {}}
        className="custom-class"
        data-testid="textarea"
      />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("custom-class");
    expect(textarea.className).toContain("rounded-sm");
  });

  it("应默认显示字数统计", () => {
    render(
      <Textarea value="测试内容" onChange={() => {}} data-testid="textarea" />,
    );

    // 检查字数统计是否存在
    const countText = screen.getByText(/\/256$/);
    expect(countText).toBeDefined();
    expect(countText.textContent).toBe("4/256");
  });

  it("应正确计算字符数", () => {
    render(
      <Textarea
        value="这是一段长文本测试"
        onChange={() => {}}
        data-testid="textarea"
      />,
    );

    // 检查字数统计，使用更灵活的查询方式
    const countContainer = screen.getByText(/\/256$/);
    expect(countContainer).toBeDefined();
    expect(countContainer.textContent).toBe("9/256");
  });

  it("当值为undefined时应显示0字符数", () => {
    render(
      <Textarea value={undefined} onChange={() => {}} data-testid="textarea" />,
    );

    // 检查字数统计
    const countElement = screen.getByText("0/256");
    expect(countElement).toBeDefined();
  });

  it("当showCount设为false时不应显示字数统计", () => {
    render(
      <Textarea
        value="测试内容"
        onChange={() => {}}
        showCount={false}
        data-testid="textarea"
      />,
    );

    // 尝试查找字数统计（应该不存在）
    const countElement = screen.queryByText(/\/256$/);
    expect(countElement).toBeNull();
  });

  it("应响应输入事件", () => {
    const handleChange = vi.fn();
    render(
      <Textarea
        value="测试内容"
        onChange={handleChange}
        data-testid="textarea"
      />,
    );

    const textarea = screen.getByTestId("textarea");

    fireEvent.change(textarea, { target: { value: "更新后的内容" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("应支持disabled状态", () => {
    render(
      <Textarea
        value="测试内容"
        onChange={() => {}}
        disabled
        data-testid="textarea"
      />,
    );

    const textarea = screen.getByTestId("textarea") as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it("应正确传递placeholder属性", () => {
    render(
      <Textarea
        value=""
        onChange={() => {}}
        placeholder="请输入内容"
        data-testid="textarea"
      />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea.getAttribute("placeholder")).toBe("请输入内容");
  });

  it("应在禁用状态下应用适当的样式", () => {
    render(
      <Textarea
        value="测试内容"
        onChange={() => {}}
        disabled
        data-testid="textarea"
      />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("disabled:cursor-not-allowed");
    expect(textarea.className).toContain("disabled:opacity-50");
  });

  it("应在聚焦时应用特定样式", () => {
    render(
      <Textarea value="测试内容" onChange={() => {}} data-testid="textarea" />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("focus-visible:ring-2");
    expect(textarea.className).toContain("focus-visible:border-theme-600");
  });

  it("应在悬停时应用特定样式", () => {
    render(
      <Textarea value="测试内容" onChange={() => {}} data-testid="textarea" />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("hover:border-theme-600");
  });

  it("当showCount为true时应有不同的样式结构", () => {
    const { container } = render(
      <Textarea
        value="测试内容"
        onChange={() => {}}
        showCount={true}
        data-testid="textarea"
      />,
    );

    // 检查外层容器
    const containerDiv = container.querySelector("div.flex.box-border");
    expect(containerDiv).not.toBeNull();

    // 检查字数容器
    const countContainer = container.querySelector(
      "div.justify-end.items-end.flex",
    );
    expect(countContainer).not.toBeNull();
  });

  it("当showCount为false时应直接渲染textarea", () => {
    const { container } = render(
      <Textarea
        value="测试内容"
        onChange={() => {}}
        showCount={false}
        data-testid="textarea"
      />,
    );

    // 检查直接子元素是否为textarea
    expect(container.firstChild?.nodeName).toBe("TEXTAREA");
  });
});
