import { DocumentNode } from "@apollo/client";
import { TableColumnType } from "antd";
import React from "react";

import { IAlertProps } from "../a-cloud-old-components/alert/type";

export interface Item {
  [props: string]: any;
}

export interface ISelectTableProps<T extends Item = Item> extends Pick<
  React.DOMAttributes<HTMLDivElement>,
  "onMouseEnter" | "onMouseLeave"
> {
  beforeOnOk?: (selectedList: Array<T>) => Promise<void>;
  onOk?: (value: Array<T>) => void;
  onCancel?: (param: { onClose: () => void }) => void;
  onSelectModalShow?: () => void;
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
  forceShowSelect?: boolean;
  modalForceRender?: boolean;
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
  maxCountOverflowTooltip?: React.ReactNode;
  hideSelectedCountRatio?: boolean;
  mode?: "sync";

  // ---here is what select table need
  title: string | React.ReactNode;
  modalTitle?: string;
  modalHeader?: React.ReactNode;
  resourceName?: string;
  modalWidth?: number;
  modalZIndex?: number;

  children: React.ReactElement;
  value?: Array<T>; // antd Form 自动注入
  onChange?: (value: Array<T>) => void; // antd Form 自动注入
  className?: string;
  listClassName?: string;
  tableLayout?: "fixed" | "auto";
  wrapClassName?: string;
  style?: React.CSSProperties;
  destroyOnClose?: boolean;
  visible?: boolean;
  setVisible?: (visible: boolean) => void;
  hideColumnHeader?: boolean;
  columnConfig?: TableColumnType<T>[];
  columnDatasourceTransform?: (datasource: any) => any;
  autoDispatch?: boolean;
  autoSelect?: boolean;
  autoSelectGql?: DocumentNode;
  transformKey?: string | ((data: any) => string);
  renderSelectedList?: () => React.ReactNode;
  tooltip?:
    | React.ReactNode
    | ((param: { isOverflowMax: boolean }) => React.ReactNode);
  /** @deprecated ModalSelect now commits the current checked list. Kept for compatibility only. */
  needRemoveSelected?: boolean;
  onTagClose?: (originSelected: Array<T>, k: string) => Array<T>;
  disableRemoveSelect?: boolean;
  customRender?: (params: {
    value?: T[];
    onChange?: (v: T[]) => void;
    onSelectModalShow: () => void;
  }) => React.ReactNode;
}

export interface ISelectTableRef<T extends Item> {
  selectedList: Array<T>;
  setSelectedList(v: Array<T>): void;
}
