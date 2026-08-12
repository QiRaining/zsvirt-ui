import type { ModelConfig } from "@ant-design/charts";
import React from "react";

type PlainObject = Record<string, any>;

export type IResourceType = "l2" | "l3" | "vm" | "cluster" | "host";

export type IRelation = {
  [K in IResourceType]?: string[] | null;
};

export interface IData {
  id: string;
  resourceType: IResourceType;
  title?: string;
  detail?: PlainObject;
  relations?: IRelation;
}

export interface INode {
  resourceType: IResourceType;
  detail?: PlainObject;
}

export interface INetworkTopoProps {
  dataSource?: IData[];
  hostCount?: number;
  clusterCount?: number;
  l2Count?: number;
  l3Count?: number;
  vmCount?: number;
  defaultVmVisible?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  onDownloadImage?: (result: { success: boolean; timestamp: number }) => void;
  customTooltipContent?: (node: INode) => React.ReactElement;
  onToggleFullscreen?: (fullscreen: boolean) => void;
}

export interface IModelConfig extends ModelConfig {
  resourceType: IResourceType;
  relations?: IRelation;
  value?: PlainObject;
  detail?: PlainObject;
}

declare type ColorType = string | null;
export declare type ShapeAttrs = {
  /** x 坐标 */
  x?: number;
  /** y 坐标 */
  y?: number;
  /** 圆半径 */
  r?: number;
  /** 描边颜色 */
  stroke?: ColorType;
  /** 描边透明度 */
  strokeOpacity?: number;
  /** 填充颜色 */
  fill?: ColorType;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 整体透明度 */
  opacity?: number;
  /** 线宽 */
  lineWidth?: number;
  /** 指定如何绘制每一条线段末端 */
  lineCap?: "butt" | "round" | "square";
  /** 用来设置2个长度不为0的相连部分（线段，圆弧，曲线）如何连接在一起的属性（长度为0的变形部分，其指定的末端和控制点在同一位置，会被忽略） */
  lineJoin?: "bevel" | "round" | "miter";
  /**
   * 设置线的虚线样式，可以指定一个数组。一组描述交替绘制线段和间距（坐标空间单位）长度的数字。 如果数组元素的数量是奇数， 数组的元素会被复制并重复。例如， [5, 15, 25] 会变成 [5, 15, 25, 5, 15, 25]。这个属性取决于浏览器是否支持 setLineDash() 函数。
   */
  lineDash?: number[] | null;
  /** Path 路径 */
  path?: string | object[];
  /** 图形坐标点 */
  points?: object[];
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 阴影模糊效果程度 */
  shadowBlur?: number;
  /** 阴影颜色 */
  shadowColor?: ColorType;
  /** 阴影 x 方向偏移量 */
  shadowOffsetX?: number;
  /** 阴影 y 方向偏移量 */
  shadowOffsetY?: number;
  /** 设置文本内容的当前对齐方式 */
  textAlign?: "start" | "center" | "end" | "left" | "right";
  /** 设置在绘制文本时使用的当前文本基线 */
  textBaseline?:
    | "top"
    | "hanging"
    | "middle"
    | "alphabetic"
    | "ideographic"
    | "bottom";
  /** 字体样式 */
  fontStyle?: "normal" | "italic" | "oblique";
  /** 文本字体大小 */
  fontSize?: number;
  /** 文本字体 */
  fontFamily?: string;
  /** 文本粗细 */
  fontWeight?: "normal" | "bold" | "bolder" | "lighter" | number;
  /** 字体变体 */
  fontVariant?: "normal" | "small-caps" | string;
  /** 文本行高 */
  lineHeight?: number;
  [key: string]: any;
};

export interface ILegend extends Pick<
  INetworkTopoProps,
  | "dataSource"
  | "hostCount"
  | "clusterCount"
  | "l2Count"
  | "l3Count"
  | "vmCount"
> {
  resourceTypeMap?: Map<IResourceType, string>;
  collapsed?: boolean;
  setCollapsed?: () => void;
  onSelect?: (id: string) => void;
}

export interface IToolbar {
  onRefresh?: () => void;
  onZoomOut?: () => void;
  onZoomIn?: () => void;
  onReset?: () => void;
  onDownload?: () => void;
  vmVisible?: boolean;
  onToggleVmVisible?: () => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}
