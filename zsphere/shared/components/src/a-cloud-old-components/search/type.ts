import { IQuery } from "@zstack/zsphere-types";

import { ITableListSearchProps } from "../table-list/type";

export interface ISearchProps extends ITableListSearchProps {
  conditions: Condition[];
  query: IQuery;
  setQuery: (query: IQuery) => void;
  container: React.RefObject<HTMLElement>;
  btnText?: string;
  onlySingleSearch?: boolean;
  hiddenSearchButton?: boolean;
}

export interface Condition {
  label: string;
  key: string;
  searchKey?: string;
  type: ConditionType;
  options?: ConditionOption[];
  remoteOptions?: any[];
  remoteOptionTextKey?: string;
  remoteOptionValueKey?: string;
  onSearch?: (value?: string) => void;
}

export type ConditionType =
  | "input"
  | "singleSelect"
  | "multipleSelect"
  | "searchSelect";

export interface ConditionOption {
  text: string;
  value: string;
  color?: string;
  count?: number;
}
