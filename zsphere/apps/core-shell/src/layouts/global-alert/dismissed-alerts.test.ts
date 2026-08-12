import { beforeEach, describe, expect, it } from "vitest";

import {
  filterDismissedAlerts,
  GLOBAL_ALERT_STORAGE_KEY,
  readDismissedAlertIds,
  writeDismissedAlertIds,
} from "./dismissed-alerts";

describe("dismissed global alerts", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("persists dismissed alert IDs for the current login session", () => {
    writeDismissedAlertIds(new Set(["community-license"]));

    expect([...readDismissedAlertIds()]).toEqual(["community-license"]);
  });

  it("does not restore a dismissed alert when new alerts arrive", () => {
    const dismissedAlertIds = new Set(["community-license"]);
    const alerts = [
      { id: "community-license" },
      { id: "https-certificate-expiring" },
    ];

    expect(filterDismissedAlerts(alerts, dismissedAlertIds)).toEqual([
      { id: "https-certificate-expiring" },
    ]);
  });

  it("fails explicitly for a malformed storage payload", () => {
    sessionStorage.setItem(GLOBAL_ALERT_STORAGE_KEY, '{"unexpected":true}');

    expect(() => readDismissedAlertIds()).toThrow(
      `Invalid ${GLOBAL_ALERT_STORAGE_KEY} session storage payload.`,
    );
  });
});
