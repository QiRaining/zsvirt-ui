import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, it, expect } from "vitest";

import { Show } from "../../../src/components/primitive/show";

describe("Show 组件", () => {
  it("当 when 为 true 时应显示子元素", () => {
    render(
      <Show when={true}>
        <div data-testid="child">测试内容</div>
      </Show>,
    );

    const child = screen.getByTestId("child");
    expect(child).toBeDefined();
    expect(child.textContent).toBe("测试内容");
  });

  it("当 when 为 false 时应不显示子元素", () => {
    render(
      <Show when={false}>
        <div data-testid="child">测试内容</div>
      </Show>,
    );

    const child = screen.queryByTestId("child");
    expect(child).toBeNull();
  });

  it("当 when 为 false 且提供 fallback 时应显示 fallback 内容", () => {
    render(
      <Show when={false} fallback={<div data-testid="fallback">备用内容</div>}>
        <div data-testid="child">测试内容</div>
      </Show>,
    );

    const fallback = screen.getByTestId("fallback");
    const child = screen.queryByTestId("child");

    expect(fallback).toBeDefined();
    expect(fallback.textContent).toBe("备用内容");
    expect(child).toBeNull();
  });

  it("当 when 为非布尔值但等价于 true 时应显示子元素", () => {
    render(
      <Show when={"非空字符串"}>
        <div data-testid="child">测试内容</div>
      </Show>,
    );

    const child = screen.getByTestId("child");
    expect(child).toBeDefined();
  });

  it("当 when 为非布尔值但等价于 false 时应不显示子元素", () => {
    render(
      <Show when={0}>
        <div data-testid="child">测试内容</div>
      </Show>,
    );

    const child = screen.queryByTestId("child");
    expect(child).toBeNull();
  });

  it("当 when 为数组且有内容时应显示子元素", () => {
    render(
      <Show when={[1, 2, 3]}>
        <div data-testid="child">测试内容</div>
      </Show>,
    );

    const child = screen.getByTestId("child");
    expect(child).toBeDefined();
  });

  it("当 when 为对象时应显示子元素", () => {
    render(
      <Show when={{ key: "value" }}>
        <div data-testid="child">测试内容</div>
      </Show>,
    );

    const child = screen.getByTestId("child");
    expect(child).toBeDefined();
  });

  it("支持复杂的嵌套结构", () => {
    render(
      <div data-testid="parent">
        <Show when={true}>
          <div data-testid="level-1">
            <Show
              when={false}
              fallback={<span data-testid="fallback">备用</span>}
            >
              <div>不应该显示</div>
            </Show>
          </div>
        </Show>
      </div>,
    );

    const parent = screen.getByTestId("parent");
    const levelOne = screen.getByTestId("level-1");
    const fallback = screen.getByTestId("fallback");

    expect(parent).toBeDefined();
    expect(levelOne).toBeDefined();
    expect(fallback).toBeDefined();
    expect(fallback.textContent).toBe("备用");
  });
});
