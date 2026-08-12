import { describe, it, expect, vi } from "vitest";

import { bus } from "../../common/bus";

describe("Event Bus", () => {
  it("should emit and receive events", () => {
    const callback = vi.fn();
    bus.addListener("test-event", callback);

    bus.emit("test-event", "test-data");
    expect(callback).toHaveBeenCalledWith("test-data");
  });

  it("should remove specific listener", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    bus.addListener("test-event", callback1);
    bus.addListener("test-event", callback2);

    bus.removeListener("test-event", callback1);
    bus.emit("test-event");

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it("should remove all listeners for an event", () => {
    const callback = vi.fn();
    bus.addListener("test-event", callback);

    bus.removeListener("test-event");
    bus.emit("test-event");

    expect(callback).not.toHaveBeenCalled();
  });
});
