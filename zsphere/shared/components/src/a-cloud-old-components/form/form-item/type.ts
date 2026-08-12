import type { IconTypes } from "@zstack/icon";
import { FormItemProps } from "antd/es/form";

import { ITooltipProps } from "../../field/type";
import { FormContextProps } from "../context";

export enum StackGlobalParamType {
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
  CommaDelimitedList = "CommaDelimitedList",
}

export interface IStackGlobalParam {
  name: string;
  Label: string;
  Description: string;
  Type: StackGlobalParamType;
  DefaultValue: string;
}

export interface IFormItemProps extends Omit<FormItemProps, "tooltip"> {
  icon?: IconTypes;
  iconTooltip?: ITooltipProps;
  labelWidth?: 160 | 120 | 148;
  formItemHeigth?: "mini" | "normal";
  tooltip?: ITooltipProps;
  description?: string | React.ReactNode;
  auth?: {
    type?: "block" | "action" | "view";
    authKey: string;
    resource: string;
  };
  selectParams?: boolean;
  hideRequiredMessage?: boolean;
  textFormItem?: boolean;
  withBorder?: boolean;
}

export type IGetRequiredParams = Pick<IFormItemProps, "rules" | "required"> &
  Pick<FormContextProps, "hideRequiredMark">;

export interface IWithTooltipProps {
  tooltip: ITooltipProps;
  trigger?: string;
  validateTrigger?: false | string | string[];
  children?: React.ReactNode;
  wrapper?: keyof HTMLElementTagNameMap;
  wrapperProps?: React.HTMLAttributes<HTMLElement>;
}
