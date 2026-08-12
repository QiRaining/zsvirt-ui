import React from "react";
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
  | "fuzzy";
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
