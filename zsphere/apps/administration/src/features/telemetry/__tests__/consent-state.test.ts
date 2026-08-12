import {
  isSuccessfulTelemetryAction,
  parseTelemetryConsent,
  parseTelemetrySettings,
  shouldOpenTelemetryGate,
} from "../consent-state";

describe("parseTelemetryConsent", () => {
  it("maps the exact None sentinel to a disabled state", () => {
    expect(
      parseTelemetryConsent({
        consentGrantedAt: "None",
      }),
    ).toEqual({ kind: "disabled" });
  });

  it("accepts a valid UTC timestamp as the enabled state", () => {
    expect(
      parseTelemetryConsent({
        consentGrantedAt: "2026-07-23T08:30:45Z",
      }),
    ).toEqual({
      kind: "enabled",
      grantedAt: "2026-07-23T08:30:45Z",
    });
  });

  it.each([
    {},
    { consentGrantedAt: "" },
    { consentGrantedAt: "none" },
    { consentGrantedAt: "2026-07-23T08:30:45+08:00" },
    { consentGrantedAt: "2026-02-30T08:30:45Z" },
  ])("rejects an invalid backend contract: %o", (inventory) => {
    expect(() => parseTelemetryConsent(inventory)).toThrow(
      "Invalid telemetry consent contract",
    );
  });
});

describe("shouldOpenTelemetryGate", () => {
  const baseInput = {
    isSystemAdmin: true,
    hasUpdatePermission: true,
    consentState: { kind: "disabled" } as const,
    settingsReady: true,
    now: 1_000,
  };

  it("opens only for the built-in Admin with a disabled authoritative state", () => {
    expect(shouldOpenTelemetryGate(baseInput)).toBe(true);
  });

  it.each([
    { isSystemAdmin: false },
    { hasUpdatePermission: false },
    { consentState: { kind: "enabled", grantedAt: "2026-07-23T08:30:45Z" } },
    { consentState: null },
    { settingsReady: false },
  ])("stays closed when a required condition is absent: %o", (override) => {
    expect(
      shouldOpenTelemetryGate({
        ...baseInput,
        ...override,
      }),
    ).toBe(false);
  });

  it("stays closed for a disabled prompt decision", () => {
    expect(
      shouldOpenTelemetryGate({
        ...baseInput,
        promptRecord: {
          version: 1,
          decision: "disabled",
          updatedAt: 500,
        },
      }),
    ).toBe(false);
  });

  it("reopens exactly at the deferred reminder boundary", () => {
    const promptRecord = {
      version: 1 as const,
      decision: "deferred" as const,
      remindAt: 1_000,
      updatedAt: 500,
    };

    expect(
      shouldOpenTelemetryGate({
        ...baseInput,
        now: 999,
        promptRecord,
      }),
    ).toBe(false);
    expect(
      shouldOpenTelemetryGate({
        ...baseInput,
        now: 1_000,
        promptRecord,
      }),
    ).toBe(true);
  });
});

describe("parseTelemetrySettings", () => {
  it("accepts the registered description key and an HTTPS policy URL", () => {
    expect(
      parseTelemetrySettings({
        descriptionKey: "telemetry.setting.description",
        privacyPolicyUrl: "https://www.zstack.io/privacy",
      }),
    ).toEqual({
      descriptionKey: "telemetry.setting.description",
      privacyPolicyUrl: "https://www.zstack.io/privacy",
    });
  });

  it.each([
    {},
    {
      descriptionKey: "telemetry.setting.unknown",
      privacyPolicyUrl: "https://www.zstack.io/privacy",
    },
    {
      descriptionKey: "telemetry.setting.description",
      privacyPolicyUrl: "",
    },
    {
      descriptionKey: "telemetry.setting.description",
      privacyPolicyUrl: "javascript:alert(1)",
    },
  ])("rejects an unsupported settings contract: %o", (inventory) => {
    expect(() => parseTelemetrySettings(inventory)).toThrow(
      "Invalid telemetry settings contract",
    );
  });
});

describe("isSuccessfulTelemetryAction", () => {
  it("requires every task to succeed", () => {
    expect(
      isSuccessfulTelemetryAction({
        total: 1,
        current: 1,
        success: 1,
        fail: 0,
        exception: 0,
      }),
    ).toBe(true);
  });

  it.each([
    {
      total: 1,
      current: 1,
      success: 0,
      fail: 1,
      exception: 0,
    },
    {
      total: 1,
      current: 1,
      success: 0,
      fail: 0,
      exception: 1,
    },
    {
      total: 2,
      current: 1,
      success: 1,
      fail: 0,
      exception: 0,
    },
  ])("rejects an incomplete or failed action: %o", (result) => {
    expect(isSuccessfulTelemetryAction(result)).toBe(false);
  });
});
