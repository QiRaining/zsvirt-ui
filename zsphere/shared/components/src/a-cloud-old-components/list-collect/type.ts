import { ITooltipProps } from "../field/type";

export interface IListCollect<T = any> {
  dataSource: Array<T>;
  add?: () => void;
  remove?: (index: number) => void;
  children?: (item: T, index: number) => React.ReactChild;
  label?: React.ReactChild;
  button?: React.ReactChild;
  labelInfo?: React.ReactChild;
  tooltip?: ITooltipProps; // 按钮禁用的提醒
  labelDescription?: React.ReactChild;
  readonly?: boolean;
  layout?: "normal" | "block" | "new";
  removeable?:
    | boolean
    | ((item: T, index: number, dataSource: Array<T>) => boolean);
  addable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
