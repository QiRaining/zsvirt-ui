import {
  clearTelemetryPromptRecord,
  createDeferredPromptRecord,
  createDisabledPromptRecord,
  getTelemetryPromptKey,
  readTelemetryPromptRecord,
  writeTelemetryPromptRecord,
} from "../prompt-storage";

const ACCOUNT_UUID = "36c27e8ff05c4780bf6d2fa65700f22e";

describe("telemetry prompt storage", () => {
  it("uses a versioned account-scoped key", () => {
    expect(getTelemetryPromptKey(ACCOUNT_UUID)).toBe(
      `zsv.telemetry.prompt.v1:${ACCOUNT_UUID}`,
    );
    expect(() => getTelemetryPromptKey("")).toThrow(
      "Telemetry prompt storage requires accountUuid",
    );
  });

  it("creates a deferred record exactly seven days in the future", () => {
    expect(createDeferredPromptRecord(1_000)).toEqual({
      version: 1,
      decision: "deferred",
      remindAt: 604_801_000,
      updatedAt: 1_000,
    });
  });

  it("creates an explicit disabled record", () => {
    expect(createDisabledPromptRecord(1_000)).toEqual({
      version: 1,
      decision: "disabled",
      updatedAt: 1_000,
    });
  });

  it("round-trips a valid record and clears it", () => {
    const storage = new MapStorage();
    const record = createDeferredPromptRecord(1_000);

    writeTelemetryPromptRecord(storage, ACCOUNT_UUID, record);

    expect(readTelemetryPromptRecord(storage, ACCOUNT_UUID)).toEqual(record);

    clearTelemetryPromptRecord(storage, ACCOUNT_UUID);

    expect(readTelemetryPromptRecord(storage, ACCOUNT_UUID)).toBeUndefined();
  });

  it.each([
    "{",
    JSON.stringify({ version: 2, decision: "deferred", updatedAt: 1_000 }),
    JSON.stringify({ version: 1, decision: "unknown", updatedAt: 1_000 }),
    JSON.stringify({
      version: 1,
      decision: "deferred",
      updatedAt: 1_000,
    }),
  ])("rejects a corrupt or unsupported record: %s", (value) => {
    const storage = new MapStorage();
    storage.setItem(getTelemetryPromptKey(ACCOUNT_UUID), value);

    expect(() => readTelemetryPromptRecord(storage, ACCOUNT_UUID)).toThrow(
      "Invalid telemetry prompt record",
    );
  });
});

class MapStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
