import type { IconTypes } from "@zstack/icon";
import { Condition, GetMetricDataQueryType } from "@zstack/zsphere-types";
import dayjs from "dayjs";

import { IDraggableCardProps } from "../a-cloud-old-components/card";
import { ISelectProps } from "../a-cloud-old-components/select";

export interface IBusinessMonitorContext {
  syncId?: string;
}

export interface IChartMonitorData {
  time: dayjs.ConfigType;
  value: number;
  type: string;
  [key: string]: any;
}

export type IValueType =
  | "percentage"
  | "bytes"
  | "bytesSpeed"
  | "ops"
  | "pps"
  | "latency"
  | "temperature";

export interface IChartMonitorProps {
  dataSource: IChartMonitorData[];
  startTime: dayjs.ConfigType;
  endTime: dayjs.ConfigType;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  width?: number;
  height?: number;
  padding?: number[];
  autoFit?: boolean;
  isEmpty?: boolean;
  nameFormatter?: (name: string) => string;
  labelFormatter?: (label: string) => string;
  valueType?: IValueType;
  valueFormatter?: (value: string) => string;
  valueTickCount?: number;
  timeMask?: "YYYY-MM-DD HH:mm:ss" | "YYYY-MM" | "MM-DD" | "HH:mm";
  timeTickCount?: number;
  tooltipExtra?: (name: string) => string;
  syncId?: string;
}

export interface ITitleSelectProps extends ISelectProps<string[]> {
  title: string;
  icon?: IconTypes;
  tooltip?: React.ReactNode;
  multiple?: boolean;
}

export interface IMonitorSelectProps extends ISelectProps<string[]> {
  trigger?: React.ReactNode;
}

export interface IBusinessMonitorProps extends Omit<
  IChartMonitorProps,
  "dataSource" | "startTime" | "endTime"
> {
  uuid: string;
  namespace: string;
  resourceType: GetMetricDataQueryType;
  resourceKey?: string;
  resourceConditions?: Condition[];
  metricNameMap?: Map<string, string>;
  metricNames?: string[];
  metricNamesWithoutLabel?: string[];
  labels?: string[];
  labelName?: string;
}

export interface IBusinessMonitorListProps {
  uuid: string;
  isEmpty?: boolean;
}

export interface IBusinessMonitorSelectProps {
  namespace: string;
  metricName: string;
  labelName: string;
  filterLabels: string;
  labels: string[];
  setLabels: (labels: string[]) => void;
  staticOptions?: {
    label: string;
    value: string;
  }[];
  selectFirstOption?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface IBusinessMonitorDataProps extends IChartMonitorData {
  metricName: string;
  label?: string;
}

export interface IBusinessTitleProps extends ITitleSelectProps {
  metricNameMap?: Map<string, string>;
}

export interface IBusinessMonitorItemsProps {
  resourceType: string;
  initialValue?: string[];
  defaultValue?: string[];
  onChange?: (value?: string[]) => void;
  options: any[];
  onSave?: () => void;
}

export interface IBusinessMonitorCardProps extends IDraggableCardProps {
  monitorKeys: string[];
  singleColumn?: boolean;
}

export interface IBusinessMonitorTimeRefs {
  startInterval: () => void;
  stopInterval: () => void;
  refresh: () => void;
}

export interface IBusinessMonitorTimeProps {
  disabled?: boolean;
  small?: boolean;
  onInterval?: () => void;
}

export interface IBusinessMonitorStoreProps {
  startTime?: number;
  setStartTime: (time: number) => void;
  endTime?: number;
  setEndTime: (time: number) => void;
  interval: number | null;
  lastInterval?: number;
  setInterval: (interval: number) => void;
  startInterval: () => void;
  stopInterval: () => void;
  increaseTime: () => void;
}

export type RangeValue = [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
