import { gql } from "@apollo/client";
import { renderHook } from "@testing-library/react";
import { GraphQLError } from "graphql";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useAsyncQuery } from "../index";

// Mock Apollo Client hooks
const mockUseApolloQuery = vi.fn();
const mockUseSubscription = vi.fn();

vi.mock("@apollo/client", () => ({
  gql: (query: any) => query,
  useQuery: (...args: any[]) => mockUseApolloQuery(...args),
  useSubscription: (...args: any[]) => mockUseSubscription(...args),
  useApolloQuery: (...args: any[]) => mockUseApolloQuery(...args),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("useAsyncQuery", () => {
  const TEST_QUERY = gql`
    query TestQuery($name: String!) {
      testQuery(name: $name) {
        list {
          uuid
          name
          description
        }
      }+
      
    }
  `;

  const TEST_DETAIL_QUERY = gql`
    query TestDetailQuery($uuid: String!) {
      resource {
        uuid
        name
        description
      }
    }
  `;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("test-session-id");
  });

  it("应该正确设置 asyncQuery 标志", () => {
    mockUseApolloQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    mockUseSubscription.mockReturnValue({ data: null });

    renderHook(() =>
      useAsyncQuery(TEST_QUERY, {
        variables: { name: "test" },
      }),
    );

    expect(mockUseApolloQuery).toHaveBeenCalledWith(
      TEST_QUERY,
      expect.objectContaining({
        variables: expect.objectContaining({
          name: "test",
          asyncQuery: true,
        }),
      }),
    );
  });

  it("应该正确处理加载状态", () => {
    mockUseApolloQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useAsyncQuery(TEST_QUERY));
    expect(result.current.loading).toBe(true);
  });

  it("应该正确处理错误状态", () => {
    const testError = new GraphQLError("Test error");
    mockUseApolloQuery.mockReturnValue({
      data: null,
      loading: false,
      error: testError,
    });

    const { result } = renderHook(() => useAsyncQuery(TEST_QUERY));
    expect(result.current.error).toBe(testError);
  });

  it("应该在变量更新时重新查询", () => {
    const { rerender } = renderHook(
      (props) => useAsyncQuery(TEST_QUERY, { variables: props }),
      { initialProps: { name: "test1" } },
    );

    rerender({ name: "test2" });

    expect(mockUseApolloQuery).toHaveBeenCalledWith(
      TEST_QUERY,
      expect.objectContaining({
        variables: expect.objectContaining({ name: "test2", asyncQuery: true }),
      }),
    );
  });

  it("应该正确处理查询失败", () => {
    const error = new Error("Query failed");
    mockUseApolloQuery.mockReturnValue({ data: null, loading: false, error });
    mockUseSubscription.mockReturnValue({ data: null });

    const { result } = renderHook(() => useAsyncQuery(TEST_QUERY));
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeNull();
  });

  it("应该在没有订阅数据时返回原始数据", () => {
    const initialData = {
      testQuery: {
        list: [{ uuid: "1", name: "item1", description: "desc1" }],
      },
    };
    mockUseApolloQuery.mockReturnValue({
      data: initialData,
      loading: false,
      error: null,
    });
    mockUseSubscription.mockReturnValue({ data: null });

    const { result } = renderHook(() => useAsyncQuery(TEST_QUERY));
    expect(result.current.data).toEqual(initialData);
  });
});
