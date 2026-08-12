import type { IconTypes } from "@zstack/icon";
import { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import { AbstractTooltipProps } from "antd/es/tooltip";

import { IProps as IAuthProps } from "../auth/type";
import { ITooltipProps } from "../field/type";
import { IProps as SkipActionProps } from "../modal/action/hooks";

declare module "antd" {
  interface DropDownProps {
    onPopupAlign?: (elem: HTMLElement) => void;
  }
}

interface notSupportedModal<T, U> {
  (selectedList?: T[], source?: U): Omit<SkipActionProps, "notSupportedList">;
}

export interface IMenuItem<T, U extends Item = Item> {
  key: string;
  name?: string;
  ActionWrapper?: React.FC<IActionWrapperProps<T>>;
  divider?: boolean;
  children?: Array<IMenuItem<T, U>>;
  preValidators?: Array<
    (selectedList: T[], source?: U) => Promise<boolean> | boolean
  >;
  validators?: Array<
    (current: T, source?: U, selectedList?: T[]) => Promise<boolean> | boolean
  >;
  primary?: boolean;
  tooltip?:
    | ITooltipProps
    | ((params: {
        disabled: boolean;
        source?: U;
        selectedList?: T[];
      }) => ITooltipProps); // 按钮禁用的提醒
  tooltipPlacement?: AbstractTooltipProps["placement"];
  defaultShowTooltip?: boolean;
  description?:
    | ITooltipProps
    | ((params: { selectedList?: T[]; source?: U }) => ITooltipProps);
  extraRender?: (params: {
    disabled: boolean;
    source?: U;
    selectedList?: T[];
    onClick: Function;
    position?: IPosition;
  }) => React.ReactNode;
  autoInjectPreValidator?: boolean;
  icon?: IconTypes;
  onClick?: (params: {
    selectedList: T[];
    setSelectedList?: (selectedList: T[]) => void;
    source?: U;
    refetch?: Function;
  }) => any;
  auth?: IAuthProps;
  disabled?: boolean;
  trigger?: "disable" | "hide";
  notSupportedModal?:
    | Omit<SkipActionProps, "notSupportedList">
    | notSupportedModal<T, U>;
  iconStyle?: React.CSSProperties;
}

export interface IFlatActionMap<T, U extends Item = Item> {
  [key: string]: {
    shouldRender: boolean;
    visible: boolean;
    preValid: boolean;
    valid: boolean;
    source?: U;
  } & Pick<
    IMenuItem<T, U>,
    | "key"
    | "name"
    | "icon"
    | "onClick"
    | "preValidators"
    | "ActionWrapper"
    | "validators"
    | "extraRender"
    | "primary"
    | "auth"
    | "trigger"
    | "tooltip"
    | "tooltipPlacement"
    | "defaultShowTooltip"
    | "disabled"
    | "notSupportedModal"
    | "iconStyle"
  >;
}

// 联合类型为 string
export type IViewMapKey =
  | "main/toolbar"
  | "main/row"
  | "main/header"
  | "recycle/toolbar"
  | "recycle/row"
  | "sub/toolbar"
  | "sub/row"
  | string;

export type IActionViewMap = {
  [prop in IViewMapKey]?: {
    activeKeys?: string[];
    extraKeys?: string[];
  };
};

export type IPosition = "toolbar" | "row" | "header" | "directory";

export interface IActionPropsCommon<T, U extends Item = Item> {
  menuList: Array<IMenuItem<T, U>>;
  viewMap?: IActionViewMap;
  activeKeys?: string[] | false;
  extraKeys?: string[] | false;
  selectedList: T[];
  setSelectedList?: (selectedList: T[]) => void;
  position?: IPosition;
  refetch?: Function;
  source?: U;
  resource?: string;
  placement?:
    | "bottomLeft"
    | "bottomRight"
    | "topLeft"
    | "topCenter"
    | "topRight"
    | "bottomCenter";
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  verifyPolicy?: "once" | "always";
  visible?: boolean;
  byRowRightClick?: boolean;
  getItemName?: (item: T) => React.ReactNode;
}

export type IActionViewPosition<T> =
  | { view: "main"; position: IPosition }
  | { view: "sub" | "recycle" | string; position: "toolbar" | "row" }
  | { view: "select" | string }
  | { view: (selectedList: T[]) => string; position: IPosition };

export type IActionProps<T, U extends Item = Item> = IActionPropsCommon<T, U> &
  IActionViewPosition<T>;
