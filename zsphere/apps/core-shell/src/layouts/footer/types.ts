import type { ITableListController } from "@zstack/zsphere-components";
import type { CurrentUser } from "@zstack/zsphere-types";
import type { IntlShape } from "react-intl";

export interface ICurrentUser extends Partial<CurrentUser> {}

export interface TabContentProps {
  currentTab: string;
  intl: IntlShape;
}

export interface TabControllerRefs {
  alarmListControllerRef: React.MutableRefObject<
    ITableListController | undefined
  >;
  thirdPartyListControllerRef: React.MutableRefObject<
    ITableListController | undefined
  >;
}

export interface ZwatchResult {
  sessionId: string;
  payload: string;
}
export interface EventResult {
  EVENT_RESOURCE_NAME: string;
  EVENT_ACCOUNT_UUID: string;
  EVENT_SUBSCRIPTION_UUID: string;
  EVENT_RESOURCE_ID: string;
  EVENT_LABELS: { [prop: string]: any };
  EVENT_NAME: string;
  EVENT_NAMESPACE: string;
  EVENT_TIME: string;
  EVENT_DATA_UUID: string;
  EVENT_EMERGENCY_LEVEL: string;
  name: string; // SessionForceLogout
}

export interface HAResult {
  haProgress: {
    taskResult: string;
    [prop: string]: any;
  };
}

export interface AlarmResult {
  ALARM_UUID: string;
  ALARM_THRESHOLD: number;
  ALARM_EMERGENCY_LEVEL: string;
  ALARM_METRIC: string;
  ALARM_CURRENT_VALUE: number;
  ALARM_COMPARISON_OPERATOR: string;
  ALARM_RESOURCE_ID: string;
  ALARM_NAMESPACE: string;
  ALARM_LABELS: { [prop: string]: any };
  ALARM_PREVIOUS_STATUS: string;
  ALARM_TIME: number;
  ALARM_ACCOUNT_UUID: string;
  ALARM_RESOURCE_NAME: string;
  ALARM_DATA_UUID: string;
  ALARM_DURATION: number;
  ALARM_CURRENT_STATUS: string;
  ALARM_NAME: string;
}
