import { Condition } from "@zstack/zsphere-types";
import { DropDownProps } from "antd";

import type { ResourceAttributeSearchParam } from "../../base-type";

export interface ISearch {
  candidates: ICandidate[];
  resourceAttributeSearch?: ResourceAttributeSearchParam;
}

export interface ICandidate {
  key: string;
  label: string;
  type: IType;
  searchKey?: string;
  options?: IOption[];
  loading?: boolean;
  placeholder?: string;
  showSearch?: boolean;
  onSearch?: (value?: string, page?: number) => void;
}

export type IType =
  | "input"
  | "singleSelect"
  | "multipleSelect"
  | "tag"
  | "fuzzy"
  | "attribute";

export interface IBaseOption {
  key: string;
  label: React.ReactNode;
}

export interface IOption extends IBaseOption {
  searchKey?: string;
  type?: IType;
  extra?: {
    i18nKey?: string;
    color?: string;
    count?: number;
    keywords?: string;
    ownerType?: string;
  };
}

export interface ILeftMenu {
  options: IOption[];
  onChange?: (value: IOption) => void;
}

export interface IContent {
  candidate: ICandidate;
  onOk?: (name: IOption, values: IOption[], needClear?: boolean) => void;
}

export interface ITag {
  candidates: ICandidate[];
  onOk?: (name: IOption, values: IOption[]) => void;
}

export interface IDropdown extends Omit<DropDownProps, "overlay"> {
  type: IType;
  options?: IOption[];
  loading?: boolean;
  placeholder?: string;
  showScroll?: boolean;
  showSearch?: boolean;
  showTabs?: boolean;
  tabs?: IOption[];
  onTabChange?: (value: string) => void;
  onSearch?: (value?: string, page?: number) => void;
  onOk?: (values: IOption[]) => void;
  children?: React.ReactNode;
}

export interface IDropdownRef {
  toggleVisible?: (visible: boolean) => void;
  clear?: (actions?: IDropdownBottomActionClear) => void;
  refresh?: () => void;
}

export interface IDropdownList {
  type: IType;
  showScroll?: boolean;
  options?: IOption[];
  loading?: boolean;
  selectedOptions?: IOption[];
  keywords?: string;
  onSelect?: (option: IOption) => void;
  onScroll?: () => void;
}

export interface IDropdownListItem {
  type: IType;
  option: IOption;
  selectedOptions?: IOption[];
  onSelect?: (option: IOption) => void;
}

export interface IDropdownListEmpty {
  type: IType;
}

export interface IDropdownBottomActionClear {
  clearKeywords?: boolean;
  clearOptions?: boolean;
}

export interface IDropdownBottomAction {
  onClear?: (actions?: IDropdownBottomActionClear) => void;
  onOk?: () => void;
}

export interface IDropdownTopAction {
  input?: {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
  };
  tabs?: {
    value?: string;
    onChange?: (value: string) => void;
    options?: IBaseOption[];
  };
}

export interface ICondition {
  name: IOption;
  values: IOption[];
  value?: IOption[];
  type?: "fromSearch" | "fromFilter";
  conditionTransform?: (values: string[]) => Condition | undefined;
}

export interface IAction {
  type: "add" | "remove" | "set" | "clear" | "setSearch" | "setFilter";
  payload?: {
    key?: string;
    type?: string;
    condition?: ICondition;
    conditions?: ICondition[];
    sortBy?: string[];
  };
}

export interface IContext {
  searchId?: string;
  dispatch?: React.Dispatch<IAction>;
  conditions?: ICondition[];
}
