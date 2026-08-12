export const GLOBAL_ALERT_STORAGE_KEY = "global-alert";

type AlertStorage = Pick<Storage, "getItem" | "setItem">;

export const filterDismissedAlerts = <T extends { id: string }>(
  alerts: readonly T[],
  dismissedAlertIds: ReadonlySet<string>,
) => alerts.filter(({ id }) => !dismissedAlertIds.has(id));

export const readDismissedAlertIds = (
  storage: Pick<AlertStorage, "getItem"> = sessionStorage,
) => {
  const storedValue = storage.getItem(GLOBAL_ALERT_STORAGE_KEY);
  if (!storedValue) {
    return new Set<string>();
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  if (
    !Array.isArray(parsedValue) ||
    parsedValue.some((alertId) => typeof alertId !== "string")
  ) {
    throw new Error(
      `Invalid ${GLOBAL_ALERT_STORAGE_KEY} session storage payload.`,
    );
  }

  return new Set(parsedValue);
};

export const writeDismissedAlertIds = (
  dismissedAlertIds: ReadonlySet<string>,
  storage: Pick<AlertStorage, "setItem"> = sessionStorage,
) => {
  storage.setItem(
    GLOBAL_ALERT_STORAGE_KEY,
    JSON.stringify([...dismissedAlertIds]),
  );
};
