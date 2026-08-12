export const DEFAULT_HEIGHT = 256;
export const COLLAPSED_HEIGHT = 40;
export const QUERY_LIMIT = 50;

export const STORAGE_KEYS = {
  VISIBLE: "zsv.footer.visible",
  TAB: "zsv.footer.tab",
  LAST_TAB: "zsv.footer.last,tab",
} as const;

export const TAB_KEYS = {
  OPERATION_LOG: "operation-log",
  ALARM_MESSAGE: "alarm-message",
  STORAGE_ALARM_MESSAGE: "storageAlarmMessage",
  UNEXISTED_TAB: "unexisted-tab",
} as const;
