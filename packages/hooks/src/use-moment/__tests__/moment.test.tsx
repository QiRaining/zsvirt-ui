import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { renderHook } from "@testing-library/react";
import moment from "moment-timezone";
import type { ReactNode } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useMoment } from "../index";

// 模拟 GraphQL 查询
const getCurrentTime = gql`
  query getCurrentTime {
    getCurrentTime {
      currentTime {
        MillionSeconds
        Seconds
      }
      timezone
      offset
    }
  }
`;

describe("useMoment", () => {
  const mockCurrentTime = 1704000000000; // 2024-01-01 00:00:00
  const mockTimezone = "Asia/Shanghai";

  // 模拟 GraphQL 响应
  const mocks = [
    {
      request: {
        query: getCurrentTime,
      },
      result: {
        data: {
          getCurrentTime: {
            currentTime: {
              MillionSeconds: mockCurrentTime,
              Seconds: mockCurrentTime / 1000,
            },
            timezone: mockTimezone,
            offset: "+08:00",
          },
        },
      },
    },
  ];

  // 包装组件以提供 Apollo Client 上下文
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );

  beforeEach(() => {
    // 重置 moment 时区
    moment.tz.setDefault();
  });

  it("应该正确初始化并返回所有必要的函数", async () => {
    const { result } = renderHook(() => useMoment(), { wrapper });

    expect(result.current.postClientTime).toBeDefined();
    expect(result.current.getServerTime).toBeDefined();
    expect(result.current.getDurationTime).toBeDefined();
    expect(result.current.refetchMoment).toBeDefined();
  });

  it("postClientTime 应该正确处理时区转换", async () => {
    const { result } = renderHook(() => useMoment(), { wrapper });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    const testDate = "2024-01-01T00:00:00Z";
    const converted = result.current.postClientTime(testDate);

    expect(converted.format()).toBe(moment.tz(testDate, mockTimezone).format());
  });

  it("getServerTime 应该正确处理不同类型的输入", async () => {
    const { result } = renderHook(() => useMoment(), { wrapper });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 测试时间戳
    const timestamp = 1704000000000;
    expect(result.current.getServerTime(timestamp).valueOf()).toBe(timestamp);

    // 测试字符串时间戳
    expect(result.current.getServerTime("1704000000000").valueOf()).toBe(
      timestamp,
    );

    // 测试 moment 对象
    const momentObj = moment();
    expect(result.current.getServerTime(momentObj).valueOf()).toBe(
      momentObj.valueOf(),
    );

    // 测试日期字符串
    const dateString = "2024-01-01T00:00:00Z";
    const expectedTime = moment
      .tz(dateString, mockTimezone)
      .add(
        moment().utcOffset() - moment.tz(dateString, mockTimezone).utcOffset(),
        "minutes",
      );
    expect(result.current.getServerTime(dateString).valueOf()).toBe(
      expectedTime.valueOf(),
    );
  });

  it("getDurationTime 应该正确计算时间差", async () => {
    const { result } = renderHook(() => useMoment(), { wrapper });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 测试一小时前的时间
    const oneHourAgo = mockCurrentTime - 3600000;
    const duration = result.current.getDurationTime(oneHourAgo);

    expect(duration.asHours()).toBe(1);
  });

  it("应该正确处理 Asia/Beijing 时区", async () => {
    const beijingMocks = [
      {
        request: {
          query: getCurrentTime,
        },
        result: {
          data: {
            getCurrentTime: {
              currentTime: {
                MillionSeconds: mockCurrentTime,
                Seconds: mockCurrentTime / 1000,
              },
              timezone: "Asia/Beijing", // 使用 Beijing 时区
              offset: "+08:00",
            },
          },
        },
      },
    ];

    const beijingWrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={beijingMocks} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useMoment(), {
      wrapper: beijingWrapper,
    });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    const testDate = "2024-01-01T00:00:00Z";
    const converted = result.current.postClientTime(testDate);

    // 应该使用 Asia/Shanghai 时区
    expect(converted.format()).toBe(
      moment.tz(testDate, "Asia/Shanghai").format(),
    );
  });

  it("当没有时区信息时应该使用本地时区", async () => {
    const noTimezoneMocks = [
      {
        request: {
          query: getCurrentTime,
        },
        result: {
          data: {
            getCurrentTime: {
              currentTime: {
                MillionSeconds: mockCurrentTime,
                Seconds: mockCurrentTime / 1000,
              },
              timezone: null,
              offset: null,
            },
          },
        },
      },
    ];

    const noTimezoneWrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={noTimezoneMocks} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useMoment(), {
      wrapper: noTimezoneWrapper,
    });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    const testDate = "2024-01-01T00:00:00Z";
    const converted = result.current.postClientTime(testDate);

    // 应该使用本地时区
    expect(converted.format()).toBe(moment(testDate).format());
  });

  it("应该正确处理无效输入", async () => {
    const { result } = renderHook(() => useMoment(), { wrapper });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 测试各种无效输入场景
    const invalidDateInputs = [
      { input: "", description: "空字符串" },
      { input: "not-a-date", description: "非日期字符串" },
      { input: "2024-13-45", description: "无效日期格式" },
      { input: "2024/99/99", description: "无效日期值" },
    ];

    // 测试 getServerTime 对无效输入的处理
    invalidDateInputs.forEach(({ input, description }) => {
      const result1 = result.current.getServerTime(input);
      expect(
        result1.isValid(),
        `getServerTime 应该正确处理 ${description}`,
      ).toBe(false);
    });

    // 测试 postClientTime 对无效输入的处理
    invalidDateInputs.forEach(({ input, description }) => {
      const result2 = result.current.postClientTime(input);
      expect(
        result2.isValid(),
        `postClientTime 应该正确处理 ${description}`,
      ).toBe(false);
    });

    // 测试 getDurationTime 对特殊输入的处理
    const specialInputs = [
      { input: undefined, expected: 0, description: "undefined" },
      { input: null, expected: 0, description: "null" },
      { input: "", expected: 0, description: "空字符串" },
    ];

    specialInputs.forEach(({ input, expected, description }) => {
      const duration = result.current.getDurationTime(input);
      expect(
        duration.asMilliseconds(),
        `getDurationTime 应该将 ${description} 视为 ${expected} 毫秒`,
      ).toBe(expected);
    });

    // 测试 getDurationTime 对无效日期的处理
    const invalidDurationInputs = [
      { input: "not-a-date", description: "非日期字符串" },
      { input: "2024-13-45", description: "无效日期格式" },
      { input: "2024/99/99", description: "无效日期值" },
    ];

    invalidDurationInputs.forEach(({ input, description }) => {
      const duration = result.current.getDurationTime(input);
      expect(
        Number.isNaN(duration.asMilliseconds()),
        `getDurationTime 应该将 ${description} 视为无效持续时间`,
      ).toBe(true);
    });

    // 测试 undefined 和 null 的特殊处理
    expect(result.current.getServerTime().isValid()).toBe(true);
    expect(result.current.postClientTime().isValid()).toBe(true);
    expect(result.current.getServerTime(null).isValid()).toBe(false);
    expect(result.current.postClientTime(null).isValid()).toBe(false);
  });

  it("应该正确处理有效的日期格式", async () => {
    const { result } = renderHook(() => useMoment(), { wrapper });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    const validDates = [
      {
        input: "2024-01-01T00:00:00Z",
        description: "ISO 8601 UTC",
      },
      {
        input: "2024-01-01T00:00:00+08:00",
        description: "ISO 8601 带时区",
      },
      {
        input: moment("2024-01-01").toISOString(),
        description: "Moment ISO 字符串",
      },
      {
        input: new Date("2024-01-01").toISOString(),
        description: "Date ISO 字符串",
      },
    ];

    validDates.forEach(({ input, description }) => {
      const serverTime = result.current.getServerTime(input);
      expect(
        serverTime.isValid(),
        `getServerTime 应该正确处理 ${description}`,
      ).toBe(true);

      const clientTime = result.current.postClientTime(input);
      expect(
        clientTime.isValid(),
        `postClientTime 应该正确处理 ${description}`,
      ).toBe(true);
    });
  });

  it("应该正确处理时区转换", async () => {
    const { result } = renderHook(() => useMoment(), { wrapper });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    const utcDate = "2024-01-01T00:00:00Z";
    const localDate = result.current.getServerTime(utcDate);

    // 验证时区转换
    expect(localDate.isValid()).toBe(true);
    expect(localDate.utcOffset()).toBe(moment().utcOffset());

    // 验证本地时间到 UTC 的转换
    const convertedUtc = result.current.postClientTime(localDate).utc();
    expect(convertedUtc.format()).toBe(moment(utcDate).utc().format());
  });

  it("应该正确处理时区偏移", async () => {
    const { result } = renderHook(() => useMoment(), { wrapper });

    // 等待 Apollo 查询完成
    await new Promise((resolve) => setTimeout(resolve, 0));

    const utcDate = "2024-01-01T00:00:00Z";
    const localDate = result.current.getServerTime(utcDate);

    // 验证时区偏移是否正确
    expect(localDate.utcOffset()).toBe(moment().utcOffset());
  });
});
