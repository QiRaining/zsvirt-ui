import { TableColumnType } from "antd";
import React from "react";

export interface Item {
  [props: string]: unknown;
}

export interface IFormTableProps<T extends Item> {
  title: string | React.ReactNode;
  columnConfig?: TableColumnType<T>[];
  maxSelectedCount?: number;
  value?: Array<T>;
  onChange?: (value: Array<T>) => void;
  alertMessage?: React.ReactNode;
  alertType?: "success" | "info" | "warning" | "error";
  children: React.ReactElement;
  primaryKey?: string;
  preSeletedList?: Array<T>; // 预选的数据，校验时需要与新选择的数据一并校验，比如校验 maxSelectedCount 时，需要与 preSeletedList 一并校验
  emptyActionText?: string | React.ReactNode;
}

export interface IFormTableRef<T extends Item> {
  selectedList: Array<T>;
  setSelectedList(v: Array<T>): void;
}
