import type { AlertProps } from "@zstack/design";
import type { TableColumnType } from "antd";
import React from "react";

export interface Item {
  [props: string]: any;
}

interface TreeItem {
  title: string;
  value: React.ReactNode | string;
  disabled?: boolean;
  children?: TreeItem[];
}

export interface ISelectTableProps<T extends Item> {
  onOk?: (value: Array<T>) => void;
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
  alertType?: AlertProps["variant"];
  alertMessage?: React.ReactNode;
  alertClosable?: boolean;

  hideHelper?: boolean;
  getHelperContainer?: (() => HTMLElement | null | undefined) | null;
  selectBtnText?: React.ReactNode;
  maxSelectedCount?: number;
  mode?: "sync";

  // ---here is what select table need
  title: string;
  modalTitle?: string;
  modalWidth?: number;
  modalZIndex?: number;

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

  loading?: boolean;
}

export interface ISelectTableRef<T extends Item> {
  selectedList: Array<T>;
  setSelectedList(v: Array<T>): void;
}
