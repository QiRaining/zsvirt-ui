import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

// Mock Apollo Client
vi.mock("@apollo/client", () => ({
  gql: () => ({}),
  useQuery: vi.fn(),
}));

// 从@apollo/client导入useQuery以获取类型
import { useQuery } from "@apollo/client";

import { useSensitiveJudge } from "../index";

const mockUseQuery = useQuery as unknown as ReturnType<typeof vi.fn>;

describe("useSensitiveJudge", () => {
  // 在每个测试后重置mock
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("当全局配置value为false时应该返回false", () => {
    // 模拟查询返回false
    mockUseQuery.mockReturnValue({
      data: {
        globalConfig: {
          value: "false",
          category: "ui",
          name: "delete.resource.double.check",
          defaultValue: "true",
          description: "是否需要二次确认删除资源",
          uuid: "test-uuid",
        },
      },
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useSensitiveJudge());

    // 验证返回值
    expect(result.current).toBe(false);
  });

  it("当全局配置value为true时应该返回true", () => {
    // 模拟查询返回true
    mockUseQuery.mockReturnValue({
      data: {
        globalConfig: {
          value: "true",
          category: "ui",
          name: "delete.resource.double.check",
          defaultValue: "true",
          description: "是否需要二次确认删除资源",
          uuid: "test-uuid",
        },
      },
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useSensitiveJudge());

    // 验证返回值
    expect(result.current).toBe(true);
  });

  it("当全局配置不存在时应该返回true（默认值）", () => {
    // 模拟查询返回空数据
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useSensitiveJudge());

    // 验证返回值
    expect(result.current).toBe(true);
  });

  it("当查询出错时应该返回true（默认值）", () => {
    // 模拟查询出错
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: new Error("查询失败"),
    });

    const { result } = renderHook(() => useSensitiveJudge());

    // 验证返回值
    expect(result.current).toBe(true);
  });

  it("当查询加载中时应该返回true（默认值）", () => {
    // 模拟查询加载中
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
    });

    const { result } = renderHook(() => useSensitiveJudge());

    // 验证返回值
    expect(result.current).toBe(true);
  });

  it("应该使用正确的查询参数", () => {
    // 模拟查询
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
    });

    renderHook(() => useSensitiveJudge());

    // 验证查询参数
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: {
          category: "ui",
          name: "delete.resource.double.check",
        },
      }),
    );
  });
});
