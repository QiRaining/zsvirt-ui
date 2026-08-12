import type { IconTypes } from "@zstack/icon";
import { Color } from "@zstack/zsphere-utils";
import { ReactNode } from "react";

interface IItem {
  label?: ReactNode;
  value?: ReactNode;
}

export interface INameItem extends IItem {
  icon?: IconTypes;
  tooltip?: ReactNode;
}

export interface ITitleItem {
  label: ReactNode;
  icon?: IconTypes;
  tooltip?: ReactNode;
  extra?: ReactNode;
}

export interface ICapacityTitle {
  title: ITitleItem | ReactNode;
}

export interface ICapacityName {
  name: INameItem | ReactNode;
  isEmpty?: boolean;
}

export interface IProgressItem {
  percentage: number;
  color?: Color.ISemantic;
  dash?: boolean;
  tooltip?: IItem[];
}

export interface ILegendItem extends IItem {
  color?: Color.ISemantic;
  dash?: boolean;
}

export enum IResourceCapacityType {
  "Percentage" = "percentage",
  "Ratio" = "ratio",
  "Distribution" = "distribution",
}

export interface IResourceCapacityProgress {
  type?: IResourceCapacityType;
  progress: IProgressItem[];
  isEmpty?: boolean;
}

export interface IResourceCapacityLegend {
  type?: IResourceCapacityType;
  legend: ILegendItem[];
  isEmpty?: boolean;
}

export type IResourceCapacityDirection = "vertical" | "horizontal";

export interface IResourceCapacity {
  title?: ITitleItem | ReactNode;
  name?: INameItem | ReactNode;
  isEmpty?: boolean;
  type?: IResourceCapacityType;
  progress: IProgressItem[];
  legend?: ILegendItem[];
  direction?: IResourceCapacityDirection;
}
