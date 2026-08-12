import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMountWatchdog } from "./mount-watchdog";

describe("createMountWatchdog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("warns after 30 seconds without failing the mount", () => {
    const onSlow = vi.fn();
    const onTimeout = vi.fn();

    createMountWatchdog({ onSlow, onTimeout });
    vi.advanceTimersByTime(30_000);

    expect(onSlow).toHaveBeenCalledOnce();
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("fails the mount only after 180 seconds", () => {
    const onSlow = vi.fn();
    const onTimeout = vi.fn();

    createMountWatchdog({ onSlow, onTimeout });
    vi.advanceTimersByTime(179_999);

    expect(onSlow).toHaveBeenCalledOnce();
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it("cancels both callbacks and remains safe when cancelled twice", () => {
    const onSlow = vi.fn();
    const onTimeout = vi.fn();
    const watchdog = createMountWatchdog({ onSlow, onTimeout });

    vi.advanceTimersByTime(29_999);
    watchdog.cancel();
    watchdog.cancel();
    vi.advanceTimersByTime(180_000);

    expect(onSlow).not.toHaveBeenCalled();
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
