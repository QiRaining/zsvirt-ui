export interface TelemetryConsentInventory {
  consentGrantedAt?: unknown;
}

export interface TelemetrySettingInventory {
  descriptionKey?: unknown;
  privacyPolicyUrl?: unknown;
}

export interface ValidTelemetrySettingInventory {
  descriptionKey: "telemetry.setting.description";
  privacyPolicyUrl: string;
}

export interface TelemetryActionResult {
  total: number;
  current: number;
  success: number;
  fail: number;
  exception: number;
}

export type TelemetryConsentState =
  | {
      kind: "disabled";
    }
  | {
      kind: "enabled";
      grantedAt: string;
    };

export interface TelemetryPromptRecordV1 {
  version: 1;
  decision: "deferred" | "disabled";
  remindAt?: number;
  updatedAt: number;
}

export interface TelemetryGateInput {
  isSystemAdmin: boolean;
  hasUpdatePermission: boolean;
  consentState: TelemetryConsentState | null;
  settingsReady: boolean;
  promptRecord?: TelemetryPromptRecordV1;
  now: number;
}

const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

const isValidUtcTimestamp = (value: string) => {
  if (!UTC_TIMESTAMP_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(value);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString() === value.replace("Z", ".000Z")
  );
};

export const parseTelemetryConsent = (
  inventory: TelemetryConsentInventory,
): TelemetryConsentState => {
  const consentGrantedAt = inventory?.consentGrantedAt;

  if (consentGrantedAt === "None") {
    return { kind: "disabled" };
  }

  if (
    typeof consentGrantedAt === "string" &&
    isValidUtcTimestamp(consentGrantedAt)
  ) {
    return {
      kind: "enabled",
      grantedAt: consentGrantedAt,
    };
  }

  throw new Error(
    `Invalid telemetry consent contract: consentGrantedAt=${String(
      consentGrantedAt,
    )}`,
  );
};

export const parseTelemetrySettings = (
  inventory: TelemetrySettingInventory,
): ValidTelemetrySettingInventory => {
  const descriptionKey = inventory?.descriptionKey;
  const privacyPolicyUrl = inventory?.privacyPolicyUrl;

  if (
    descriptionKey !== "telemetry.setting.description" ||
    typeof privacyPolicyUrl !== "string"
  ) {
    throw new Error(
      `Invalid telemetry settings contract: descriptionKey=${String(
        descriptionKey,
      )}, privacyPolicyUrl=${String(privacyPolicyUrl)}`,
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(privacyPolicyUrl);
  } catch (error) {
    throw new Error(
      `Invalid telemetry settings contract: privacyPolicyUrl=${privacyPolicyUrl}`,
      { cause: error },
    );
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error(
      `Invalid telemetry settings contract: privacyPolicyUrl=${privacyPolicyUrl}`,
    );
  }

  return {
    descriptionKey,
    privacyPolicyUrl,
  };
};

export const isSuccessfulTelemetryAction = (
  result: TelemetryActionResult,
): boolean =>
  result.total > 0 &&
  result.current === result.total &&
  result.success === result.total &&
  result.fail === 0 &&
  result.exception === 0;

export const shouldOpenTelemetryGate = ({
  isSystemAdmin,
  hasUpdatePermission,
  consentState,
  settingsReady,
  promptRecord,
  now,
}: TelemetryGateInput) => {
  if (
    !isSystemAdmin ||
    !hasUpdatePermission ||
    consentState?.kind !== "disabled" ||
    !settingsReady
  ) {
    return false;
  }

  if (!promptRecord) {
    return true;
  }

  if (promptRecord.decision === "disabled") {
    return false;
  }

  return (
    promptRecord.decision === "deferred" &&
    typeof promptRecord.remindAt === "number" &&
    now >= promptRecord.remindAt
  );
};
