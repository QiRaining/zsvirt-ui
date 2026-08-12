import type { IconTypes } from "@zstack/icon";
import { IllustrationTypes } from "@zstack/zsphere-illustration";
import { CardProps } from "antd/lib/card";
import { ReactNode } from "react";

export interface ICardProps extends CardProps {
  collapsible?: boolean;
  collapsed?: boolean;
  icon?: IconTypes;
  colorfulIconKey?: IllustrationTypes;
  subTitle?: ReactNode;
}

export interface TitleAction {
  title?: string;
  icon?: IconTypes;
  tooltip?: string;
  onClick?: () => void;
  authKey?: string;
  resource?: string;
  disabled?: boolean;
}

export interface IDraggableCardProps extends CardProps {
  subTitle?: ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  isList?: boolean;
  onCollapseChange?: (e: boolean) => void;
  titleActions?: TitleAction[];
}
