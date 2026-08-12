import { gql } from "@apollo/client";
import { renderHook } from "@testing-library/react";
import { bus } from "@zstack/utils";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useAction } from "../index";

// 模拟 bus
vi.mock("@zstack/utils", async () => {
  const actual = await vi.importActual("@zstack/utils");
  return {
    ...actual,
    genUuid: () => "test-uuid-123",
    bus: {
      emit: vi.fn(),
      addListener: vi.fn((event, callback) => {
        if (event.startsWith("action:progress:")) {
          callback({ current: 1, total: 2 });
          callback({ current: 2, total: 2 });
        } else if (event.startsWith("action:finish:")) {
          callback({ success: true });
        }
      }),
      removeListener: vi.fn(),
    },
  };
});

// 模拟 Apollo Client
const mockMutate = vi.fn();
const mockWriteFragment = vi.fn();
const mockReadFragment = vi.fn();
const mockIdentify = vi.fn();

vi.mock("@apollo/client", async () => {
  const actual = await vi.importActual("@apollo/client");
  return {
    ...actual,
    useApolloClient: () => ({
      mutate: mockMutate,
      cache: {
        identify: mockIdentify,
        writeFragment: mockWriteFragment,
        readFragment: mockReadFragment,
      },
      readFragment: mockReadFragment,
      writeFragment: mockWriteFragment,
    }),
  };
});

// 模拟 window.g_action_subscribe
const mockNext = vi.fn();
beforeEach(() => {
  // @ts-expect-error
  window.g_action_subscribe = { next: mockNext };
  localStorage.setItem("sessionId", "test-session");
  // 清除所有模拟函数的调用记录
  vi.clearAllMocks();
});

describe("useAction", () => {
  it("应该能正确执行基础的 mutation 操作", async () => {
    const { result } = renderHook(() => useAction());
    const doAction = result.current;

    // 准备测试数据
    const mockMutation = gql`
      mutation test {
        test
      }
    `;
    const actionParams = {
      mutation: mockMutation,
      name: "测试操作",
      total: 1,
      payload: { test: true },
    };

    // 模拟 mutation 返回结果
    mockMutate.mockResolvedValueOnce({ data: { test: true } });

    // 执行操作
    await doAction(actionParams);

    // 验证 mutation 调用参数是否正确
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: mockMutation,
      variables: {
        input: {
          payload: { test: true },
          action: {
            name: "测试操作",
            total: 1,
            actionId: expect.any(String),
          },
        },
      },
    });

    // 验证是否触发了正确的事件
    expect(bus.emit).toHaveBeenCalledWith(
      "addAction",
      expect.any(String),
      "测试操作",
      1,
      undefined,
    );
  });

  it("应该能正确处理中间状态更新", async () => {
    const { result } = renderHook(() => useAction());
    const doAction = result.current;

    // 准备测试数据
    const mockMutation = gql`
      mutation test {
        test
      }
    `;
    const middleState = {
      type: "TestType",
      uuids: ["test-uuid"],
      field: "status",
      data: { status: "running" },
    };

    // 设置模拟返回值
    mockIdentify.mockReturnValue("TestType:test-uuid");
    mockReadFragment.mockReturnValue({
      status: "initial",
      __typename: "TestType",
    });
    mockMutate.mockResolvedValueOnce({ data: { test: true } });

    // 执行操作
    await doAction({
      mutation: mockMutation,
      name: "测试操作",
      total: 1,
      payload: { test: true },
      middleState,
    });

    // 验证缓存操作
    expect(mockWriteFragment).toHaveBeenCalledWith({
      id: "TestType:test-uuid",
      fragment: expect.any(Object),
      data: { status: "running" },
      broadcast: false,
    });

    // 验证进度通知
    expect(mockNext).toHaveBeenCalledWith({
      data: {
        type: "TestType",
        actionId: expect.any(String),
        id: "test-uuid",
        fields: "status",
        state: "Running",
        sessionId: "test-session",
      },
      type: "progress",
    });
  });

  it("应该能正确处理进度回调", async () => {
    const { result } = renderHook(() => useAction());
    const doAction = result.current;

    // 准备回调函数
    const onProgress = vi.fn();
    const onFinish = vi.fn();

    // 准备测试数据
    const mockMutation = gql`
      mutation test {
        test
      }
    `;
    mockMutate.mockResolvedValueOnce({ data: { test: true } });

    // 执行操作
    await doAction({
      mutation: mockMutation,
      name: "测试操作",
      total: 2,
      payload: { test: true },
      onProgress,
      onFinish,
    });

    // 模拟进度事件
    bus.emit(`action:progress:${expect.any(String)}`, { current: 1, total: 2 });
    bus.emit(`action:progress:${expect.any(String)}`, { current: 2, total: 2 });

    // 验证回调函数调用
    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        current: expect.any(Number),
        total: 2,
      }),
    );
  });
});
