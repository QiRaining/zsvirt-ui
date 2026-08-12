import { renderHook, act } from "@testing-library/react";
import dayjs from "dayjs";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useMonitorTime } from "../index";

describe("useMonitorTime", () => {
  // 模拟时间相关的常量
  const mockInitialTime = 1704000000000; // 2024-01-01 00:00:00
  const mockInitialStartTime = mockInitialTime - 15 * 60 * 1000; // 15分钟前

  beforeEach(() => {
    // 重置所有的模拟函数
    vi.clearAllMocks();
    // 重置定时器
    vi.clearAllTimers();
    // 使用假定时器
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 恢复真实定时器
    vi.useRealTimers();
  });

  it("应该使用默认值正确初始化", () => {
    const { result } = renderHook(() => useMonitorTime());

    expect(result.current.startTime).toBeDefined();
    expect(result.current.endTime).toBeDefined();
    expect(result.current.period).toBeDefined();
    expect(result.current.startInterval).toBeDefined();
    expect(result.current.stopInterval).toBeDefined();

    // 验证默认的时间间隔是15分钟
    const timeDiff = result.current.endTime - result.current.startTime;
    expect(timeDiff).toBe(15 * 60 * 1000);
  });

  it("应该正确处理自定义初始时间", () => {
    const { result } = renderHook(() =>
      useMonitorTime(mockInitialStartTime, mockInitialTime),
    );

    expect(result.current.startTime).toBe(mockInitialStartTime);
    expect(result.current.endTime).toBe(mockInitialTime);
  });

  it("应该根据时间范围正确计算period", () => {
    // 测试不同时间范围的period计算
    const testCases = [
      {
        start: dayjs().subtract(2, "years").valueOf(),
        end: dayjs().valueOf(),
        expectedPeriod: 52704,
      },
      {
        start: dayjs().subtract(2, "months").valueOf(),
        end: dayjs().valueOf(),
        expectedPeriod: 8064,
      },
      {
        start: dayjs().subtract(2, "weeks").valueOf(),
        end: dayjs().valueOf(),
        expectedPeriod: 4464,
      },
      {
        start: dayjs().subtract(1, "week").valueOf(),
        end: dayjs().valueOf(),
        expectedPeriod: 2016,
      },
      {
        start: dayjs().subtract(1, "day").valueOf(),
        end: dayjs().valueOf(),
        expectedPeriod: 288,
      },
      {
        start: dayjs().subtract(6, "hours").valueOf(),
        end: dayjs().valueOf(),
        expectedPeriod: 72,
      },
      {
        start: dayjs().subtract(1, "hour").valueOf(),
        end: dayjs().valueOf(),
        expectedPeriod: 12,
      },
      {
        start: dayjs().subtract(30, "minutes").valueOf(),
        end: dayjs().valueOf(),
        expectedPeriod: 3,
      },
    ];

    testCases.forEach(({ start, end, expectedPeriod }) => {
      const { result } = renderHook(() => useMonitorTime(start, end));
      expect(result.current.period).toBe(expectedPeriod);
    });
  });

  it("应该能够正确启动和停止时间间隔", () => {
    const { result } = renderHook(() =>
      useMonitorTime(mockInitialStartTime, mockInitialTime),
    );

    // 初始状态下应该自动启动interval
    expect(result.current.startTime).toBe(mockInitialStartTime);
    expect(result.current.endTime).toBe(mockInitialTime);

    // 停止interval
    act(() => {
      result.current.stopInterval();
    });

    // 记录当前时间
    const startTimeBeforeWait = result.current.startTime;
    const endTimeBeforeWait = result.current.endTime;

    // 等待一段时间
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // 时间应该保持不变
    expect(result.current.startTime).toBe(startTimeBeforeWait);
    expect(result.current.endTime).toBe(endTimeBeforeWait);

    // 重新启动interval
    act(() => {
      result.current.startInterval();
    });

    // 等待一个完整的interval周期
    act(() => {
      vi.advanceTimersByTime(12000); // 最小间隔是12秒
    });

    // 时间应该已经更新
    expect(result.current.startTime).toBeGreaterThan(startTimeBeforeWait);
    expect(result.current.endTime).toBeGreaterThan(endTimeBeforeWait);
  });

  it("应该正确响应initialStartTime和initialEndTime的变化", () => {
    const { result, rerender } = renderHook(
      ({ start, end }) => useMonitorTime(start, end),
      {
        initialProps: {
          start: mockInitialStartTime,
          end: mockInitialTime,
        },
      },
    );

    // 验证初始值
    expect(result.current.startTime).toBe(mockInitialStartTime);
    expect(result.current.endTime).toBe(mockInitialTime);

    // 更新时间
    const newStartTime = mockInitialStartTime + 60 * 1000;
    const newEndTime = mockInitialTime + 60 * 1000;

    // 重新渲染hook
    rerender({ start: newStartTime, end: newEndTime });

    // 验证更新后的值
    expect(result.current.startTime).toBe(newStartTime);
    expect(result.current.endTime).toBe(newEndTime);
  });
});
