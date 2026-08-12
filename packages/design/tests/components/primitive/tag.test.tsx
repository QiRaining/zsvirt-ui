import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { Tag } from "../../../src/components/primitive/tag";

describe("Tag 组件", () => {
  it("应正确渲染标签内容", () => {
    render(<Tag data-testid="tag">测试标签</Tag>);

    const tag = screen.getByTestId("tag");
    expect(tag).toBeDefined();
    expect(tag.textContent).toBe("测试标签");
  });

  it("应正确应用className", () => {
    render(
      <Tag className="custom-class" data-testid="tag">
        测试标签
      </Tag>,
    );

    const tag = screen.getByTestId("tag");
    expect(tag.className).toContain("custom-class");
  });

  it("应正确应用圆角样式", () => {
    render(
      <Tag round data-testid="tag">
        测试标签
      </Tag>,
    );

    const tag = screen.getByTestId("tag");
    expect(tag.className).toContain("rounded-[12px]");
  });

  it("应默认应用方形样式", () => {
    render(<Tag data-testid="tag">测试标签</Tag>);

    const tag = screen.getByTestId("tag");
    expect(tag.className).toContain("rounded-[2px]");
    expect(tag.className).not.toContain("rounded-[12px]");
  });

  it("应正确应用颜色样式", () => {
    render(
      <Tag color="#318857" data-testid="tag">
        测试标签
      </Tag>,
    );

    const tag = screen.getByTestId("tag");
    expect(tag.className).toContain("bg-green-100");
    expect(tag.className).toContain("text-green-600");
  });

  it("应正确应用尺寸样式", () => {
    render(
      <Tag size="large" data-testid="tag">
        测试标签
      </Tag>,
    );

    const tag = screen.getByTestId("tag");
    expect(tag.className).toContain("px-[12px]");
    expect(tag.className).toContain("h-[32px]");
  });

  it("当设置closable为true时应显示关闭按钮", () => {
    const { container } = render(
      <Tag closable data-testid="tag">
        测试标签
      </Tag>,
    );

    const svgElement = container.querySelector("svg");
    expect(svgElement).not.toBeNull();
    expect(svgElement?.getAttribute("type")).toBe("close");
  });

  it("当点击关闭按钮时应触发onClose回调", () => {
    const onCloseMock = vi.fn();
    const { container } = render(
      <Tag closable onClose={onCloseMock} data-testid="tag">
        测试标签
      </Tag>,
    );

    const svgElement = container.querySelector("svg");
    expect(svgElement).not.toBeNull();
    fireEvent.click(svgElement!);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("应正确应用主题和级别样式", () => {
    render(
      <Tag theme="blue" level="strong" data-testid="tag">
        测试标签
      </Tag>,
    );

    const tag = screen.getByTestId("tag");
    expect(tag.className).toContain("bg-blue-500");
    expect(tag.className).toContain("text-neutral-0");
  });

  it("应正确传递其他HTML属性", () => {
    render(
      <Tag data-testid="tag" title="自定义标题">
        测试标签
      </Tag>,
    );

    const tag = screen.getByTestId("tag");
    expect(tag.getAttribute("title")).toBe("自定义标题");
  });
});
