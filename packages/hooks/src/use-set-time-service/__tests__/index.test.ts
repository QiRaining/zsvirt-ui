/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { TimeService } from "../time-service";

describe("TimeService", () => {
  let timeService: TimeService;
  let mockWorker: Worker;

  beforeEach(() => {
    // 模拟 Worker
    mockWorker = {
      onmessage: null,
      postMessage: vi.fn(),
    } as any;

    // 初始化 TimeService
    timeService = new TimeService(mockWorker);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("应该能够启动计时器", () => {
    timeService.startTimer();
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      op: "start",
      time: expect.any(Number),
    });
  });

  it("应该能够停止计时器", () => {
    timeService.stopTimer();
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      op: "stop",
    });
  });

  it("应该能够重置计时器", () => {
    timeService.resetTimer();
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      op: "stop",
    });
    // 重置会先调用 stop，然后调用 start
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      op: "start",
      time: expect.any(Number),
    });
  });

  it("应该能够通知时间变化监听器", () => {
    const mockListener = vi.fn();
    const testTime = 1640995200000; // 2022-01-01 00:00:00

    timeService.addTimeChangeListener(mockListener);
    // 模拟 worker 发送消息
    mockWorker.onmessage?.({ data: testTime } as any);

    expect(mockListener).toHaveBeenCalledWith(testTime);
  });
});
