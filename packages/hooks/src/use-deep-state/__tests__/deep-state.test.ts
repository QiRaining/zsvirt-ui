import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useDeepState } from "../index";

describe("useDeepState", () => {
  it("应该返回初始状态值", () => {
    const initialState = { count: 1, name: "test" };
    const { result } = renderHook(() => useDeepState(initialState));
    expect(result.current).toEqual(initialState);
  });

  it("当对象内容相同时应该返回相同的引用", () => {
    const initialState = { count: 1, name: "test" };
    const { result, rerender } = renderHook(
      ({ state }) => useDeepState(state),
      {
        initialProps: { state: initialState },
      },
    );

    const firstRender = result.current;

    // 重新渲染，但使用相同的值
    rerender({ state: { count: 1, name: "test" } });

    // 由于内容相同，应该返回相同的引用
    expect(result.current).toBe(firstRender);
  });

  it("当对象内容不同时应该返回新的引用", () => {
    const initialState = { count: 1, name: "test" };
    const { result, rerender } = renderHook(
      ({ state }) => useDeepState(state),
      {
        initialProps: { state: initialState },
      },
    );

    const firstRender = result.current;

    // 重新渲染，使用不同的值
    rerender({ state: { count: 2, name: "test" } });

    // 由于内容不同，应该返回新的引用
    expect(result.current).not.toBe(firstRender);
    expect(result.current).toEqual({ count: 2, name: "test" });
  });

  it("当禁用深比较时，即使内容相同也应该返回新的引用", () => {
    const initialState = { count: 1, name: "test" };
    const { result, rerender } = renderHook(
      ({ state }) => useDeepState(state, { deep: false }),
      {
        initialProps: { state: initialState },
      },
    );

    const firstRender = result.current;

    // 重新渲染，使用相同的值但是新的对象
    rerender({ state: { count: 1, name: "test" } });

    // 由于禁用了深比较，应该返回新的引用
    expect(result.current).not.toBe(firstRender);
    expect(result.current).toEqual(firstRender);
  });

  it("应该正确处理嵌套对象", () => {
    const initialState = {
      user: {
        profile: {
          name: "test",
          age: 25,
        },
        settings: {
          theme: "dark",
        },
      },
    };

    const { result, rerender } = renderHook(
      ({ state }) => useDeepState(state),
      {
        initialProps: { state: initialState },
      },
    );

    const firstRender = result.current;

    // 重新渲染，使用相同的嵌套结构
    rerender({
      state: {
        user: {
          profile: {
            name: "test",
            age: 25,
          },
          settings: {
            theme: "dark",
          },
        },
      },
    });

    // 由于内容相同，应该返回相同的引用
    expect(result.current).toBe(firstRender);

    // 修改嵌套值
    rerender({
      state: {
        user: {
          profile: {
            name: "test",
            age: 26, // 修改了年龄
          },
          settings: {
            theme: "dark",
          },
        },
      },
    });

    // 由于内容不同，应该返回新的引用
    expect(result.current).not.toBe(firstRender);
    expect(result.current.user.profile.age).toBe(26);
  });

  it("应该正确处理数组", () => {
    const initialState = {
      items: [1, 2, 3],
      tags: ["a", "b", "c"],
    };

    const { result, rerender } = renderHook(
      ({ state }) => useDeepState(state),
      {
        initialProps: { state: initialState },
      },
    );

    const firstRender = result.current;

    // 重新渲染，使用相同的数组
    rerender({
      state: {
        items: [1, 2, 3],
        tags: ["a", "b", "c"],
      },
    });

    // 由于内容相同，应该返回相同的引用
    expect(result.current).toBe(firstRender);

    // 修改数组内容
    rerender({
      state: {
        items: [1, 2, 3, 4],
        tags: ["a", "b", "c"],
      },
    });

    // 由于内容不同，应该返回新的引用
    expect(result.current).not.toBe(firstRender);
    expect(result.current.items).toEqual([1, 2, 3, 4]);
  });
});
