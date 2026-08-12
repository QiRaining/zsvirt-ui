import type { IconTypes } from "@zstack/icon";
import { Color } from "@zstack/zsphere-utils";
import { TooltipPropsWithTitle } from "antd/es/tooltip";
import { ParagraphProps } from "antd/es/typography/Paragraph";

import { IActionProps } from "../auth/type";
import { aligns } from "./const";
import Group from "./group";
import Horizontal from "./horizontal";
import Vertical from "./vertical";

export type ITooltipProps =
  | ({ markdown?: boolean } & (
      | TooltipPropsWithTitle["title"]
      | TooltipPropsWithTitle
    ))
  | undefined
  | null;

export interface IFieldCommonProps {
  label: string | React.ReactNode;
  color?: Color.ISemantic;
  iconColor?: Color.ISemantic;
  icon?: IconTypes;
  children: React.ReactNode;
  auth?: {
    type?: "block" | "action" | "view";
    authKey: string;
    resource: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

export interface IFieldVerticalProps extends IFieldCommonProps {
  align?: keyof typeof aligns;
}

export interface IFieldHorizontalProps
  extends IFieldCommonProps, Pick<ParagraphProps, "copyable" | "ellipsis"> {
  tooltip?: ITooltipProps;
  iconTooltip?: ITooltipProps;
  labelWidth?: React.CSSProperties["width"];
  onEdit?: () => void;
  editTooltip?: boolean | React.ReactNode;
  colon?: boolean;
  emptyText?: React.ReactNode;
}

export type IFieldGroup = (
  | {
      type: "vertical";
      options?: Array<IFieldVerticalProps>;
    }
  | {
      type?: "horizontal";
      tooltip?: ITooltipProps;
      options?: Array<IFieldHorizontalProps>;
      onEdit?: () => void;
      actionAuthKey?: IActionProps;
      disabled?: boolean;
    }
) &
  Pick<IFieldCommonProps, "auth" | "className" | "style"> & {
    children?: React.ReactNode;
  };

export type IFieldProps =
  | ({ type: "vertical" } & IFieldVerticalProps)
  | ({ type?: "horizontal" } & IFieldHorizontalProps);

export interface IField extends React.FC<IFieldProps> {
  Vertical: typeof Vertical;
  Horizontal: typeof Horizontal;
  Group: typeof Group;
}
