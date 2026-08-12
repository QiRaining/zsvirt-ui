/**
 * @vitest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { TimeProvider, useTime } from "../index";

// 扩展 dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

describe("useTime", () => {
  const mockServerTime = {
    millionSecondsGap: 1000, // 模拟服务器时间比客户端时间慢1秒
    timezone: "Asia/Shanghai",
  };

  const fixedTime = 1640995200000; // 2022-01-01 00:00:00

  // 包装器组件
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TimeProvider serverTime={mockServerTime}>{children}</TimeProvider>
  );

  beforeEach(() => {
    // 模拟 Date.now()
    vi.spyOn(Date, "now").mockImplementation(() => fixedTime);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("应该能够获取当前服务器时间（毫秒）", () => {
    const { result } = renderHook(() => useTime(), { wrapper });
    expect(result.current.getCurrentServerTimeMillionSeconds()).toBe(
      fixedTime - mockServerTime.millionSecondsGap,
    );
  });

  it("应该能够处理客户端时间", () => {
    const { result } = renderHook(() => useTime(), { wrapper });
    const testDate = "2022-01-01T00:00:00+08:00";
    const clientTime = result.current.postClientTime(testDate);
    expect(clientTime.format()).toBe("2022-01-01T00:00:00+08:00");
  });

  it("应该能够处理服务器时间", () => {
    const { result } = renderHook(() => useTime(), { wrapper });

    // 测试数字类型
    expect(result.current.getServerTime(fixedTime).valueOf()).toBe(fixedTime);

    // 测试数字字符串
    expect(result.current.getServerTime(fixedTime.toString()).valueOf()).toBe(
      fixedTime,
    );

    // 测试普通日期字符串
    const testDate = "2022-01-01T00:00:00+08:00";
    const serverTime = result.current.getServerTime(testDate);
    expect(serverTime.isValid()).toBe(true);
    expect(serverTime.format("YYYY-MM-DD HH:mm:ss")).toBe(
      "2022-01-01 00:00:00",
    );
  });

  it("应该能够计算持续时间", () => {
    const { result } = renderHook(() => useTime(), { wrapper });

    // 测试空值
    expect(result.current.getDurationTime().asMilliseconds()).toBe(0);

    // 测试具体时间
    const testDate = dayjs(fixedTime).subtract(1, "hour");
    const duration = result.current.getDurationTime(testDate);
    // 使用近似值比较
    expect(Math.round(duration.asHours())).toBe(1);
  });

  it("在没有 Provider 的情况下应该提供默认值", () => {
    const { result } = renderHook(() => useTime());

    // 测试默认值
    expect(result.current.getCurrentServerTimeMillionSeconds()).toBe(fixedTime);

    // 验证时间格式化
    const formattedTime = result.current
      .postClientTime(fixedTime)
      .format("YYYY-MM-DD HH:mm:ss");
    expect(formattedTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});
