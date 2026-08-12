import type { TelemetryPromptRecordV1 } from "./consent-state";

const TELEMETRY_PROMPT_STORAGE_PREFIX = "zsv.telemetry.prompt.v1";
const SEVEN_DAYS_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1_000;

export const getTelemetryPromptKey = (accountUuid: string) => {
  if (!accountUuid) {
    throw new Error("Telemetry prompt storage requires accountUuid");
  }

  return `${TELEMETRY_PROMPT_STORAGE_PREFIX}:${accountUuid}`;
};

export const createDeferredPromptRecord = (
  now: number,
): TelemetryPromptRecordV1 => ({
  version: 1,
  decision: "deferred",
  remindAt: now + SEVEN_DAYS_IN_MILLISECONDS,
  updatedAt: now,
});

export const createDisabledPromptRecord = (
  now: number,
): TelemetryPromptRecordV1 => ({
  version: 1,
  decision: "disabled",
  updatedAt: now,
});

const isTelemetryPromptRecord = (
  value: unknown,
): value is TelemetryPromptRecordV1 => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<TelemetryPromptRecordV1>;

  if (
    record.version !== 1 ||
    typeof record.updatedAt !== "number" ||
    !Number.isFinite(record.updatedAt)
  ) {
    return false;
  }

  if (record.decision === "disabled") {
    return true;
  }

  return (
    record.decision === "deferred" &&
    typeof record.remindAt === "number" &&
    Number.isFinite(record.remindAt)
  );
};

export const readTelemetryPromptRecord = (
  storage: Storage,
  accountUuid: string,
): TelemetryPromptRecordV1 | undefined => {
  const key = getTelemetryPromptKey(accountUuid);
  const value = storage.getItem(key);

  if (value === null) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!isTelemetryPromptRecord(parsed)) {
      throw new Error("Unsupported telemetry prompt record shape");
    }

    return parsed;
  } catch (error) {
    throw new Error(`Invalid telemetry prompt record for key ${key}`, {
      cause: error,
    });
  }
};

export const writeTelemetryPromptRecord = (
  storage: Storage,
  accountUuid: string,
  record: TelemetryPromptRecordV1,
) => {
  storage.setItem(getTelemetryPromptKey(accountUuid), JSON.stringify(record));
};

export const clearTelemetryPromptRecord = (
  storage: Storage,
  accountUuid: string,
) => {
  storage.removeItem(getTelemetryPromptKey(accountUuid));
};
