import { TableColumnType } from "antd";
import React from "react";

import type { IAlertProps } from "../a-cloud-old-components/alert/type";

export interface Item {
  [props: string]: any;
}

export interface TreeItem {
  attr?: any;
  title: React.ReactNode | string;
  state?: string;
  icon?: string;
  key: string;
  children?: TreeItem[];
  disabled?: boolean;
  tooltip?: string;
}

export interface ISelectTableProps<T extends Item> {
  onOk?: (value: Array<T>) => void;
  onCheck?: (
    checkedKeys: T[],
    e: {
      checked: boolean;
      checkedNodes: any[];
      node: any;
      event: any;
      halfCheckedKeys: string[];
    },
    oldValue?: T[],
  ) => T[];
  renderSummary?: (item: T) => React.ReactNode;
  renderFooter?: (args: {
    node: React.ReactNode;
    onOk: Function;
    onCancel: Function;
    selectedList: Array<T>;
  }) => React.ReactNode;
  renderItemContent?: (data: T) => React.ReactNode;
  selectType?: "checkbox" | "radio";
  label?: React.ReactChild;
  showSelect?: boolean;
  type?: "normal" | "tag";
  width?: 800 | 600;
  id?: string; // antd Form 自动注入 (用于错误时自动滚动到该位置)
  visibleKey?: keyof T;
  primaryKey?: keyof T;
  disabledBtn?: boolean;
  isSingleSelect?: boolean;
  disabledItem?: boolean | ((current?: T) => boolean);
  alertType?: IAlertProps["type"];
  alertMessage?: IAlertProps["message"];
  alertClosable?: boolean;

  hideHelper?: boolean;
  getHelperContainer?: (() => HTMLElement | null | undefined) | null;
  selectBtnText?: React.ReactNode;
  maxSelectedCount?: number;
  mode?: "sync";

  value?: Array<T>; // antd Form 自动注入
  onChange?: (value: Array<T>) => void; // antd Form 自动注入
  className?: string;
  style?: React.CSSProperties;
  destroyOnClose?: boolean;
  visible?: boolean;
  setVisible?: (visible: boolean) => void;
  columnConfig?: TableColumnType<T>[];
  transformKey?: string;
  treeData: TreeItem[];
  checkItemDisabled?: (
    item: any,
    selectedKeys: T[],
  ) => boolean | { disabled: boolean; tooltip: string };
  loading?: boolean;
}

export interface ISelectTableRef<T extends Item> {
  selectedList: Array<T>;
  setSelectedList(v: Array<T>): void;
}
