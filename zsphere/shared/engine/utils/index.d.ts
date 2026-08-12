import { IColumnType as ColumnType } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import React from "react";

import { ILinkResource } from "./link";
import { ICandidate } from "./types";
type ConstantType = string;
export interface Condition {
  key: string;
  value?: string | number | boolean;
  values?: (string | number | boolean)[];
  op?: Op;
}
export type IColumnEmptyType = "notSupport" | "notConfig";
export declare const actionKey: "__action__";
export interface Item {
  [prop: string]: any;
}
export type IKey<T extends Item> = keyof T | typeof actionKey;
export interface IColumnType<T extends Item = any> extends ColumnType<T> {
  key: string;
  linkResource?: ILinkResource;
  formatter?: (value: T) => any;
  primaryKey?: string;
  filterOptions?: {
    [key: string]: string | number;
  };
  filterEnumType?: ConstantType;
  extra?: (value: T) => React.ReactNode;
}
export interface IOption {
  key: string;
  children?: IOption[];
  [prop: string]: any;
}
interface IQuery {
  key: string;
  [prop: string]: any;
}
export declare function getOption<T extends Item = any>(
  key: string,
  options: IColumnType<T>[],
): IColumnType<T> | undefined;
export declare const defaultFormatter: (value: any, key: string) => any;
export declare function formatValue<T extends Item = any>(
  key: string,
  value: any,
  options: IColumnType<T>[],
): any;
export declare function formatLinkUuid<T extends Item = any>(
  key: string,
  value: any,
  options: IColumnType<T>[],
): any;
export declare function handleColumnList<
  T extends {
    [prop: string]: any;
  },
>(options: IColumnType<T>[], list: IColumnType<T>[]): IColumnType<T>[];
export declare function handleActionList(
  options: IOption[],
  list: IOption[],
): IOption[];
export declare function mergeCandidates(
  source: ICandidate[],
  target: ICandidate[],
): ICandidate[];
export declare function concatCandidates(
  source: ICandidate[],
  target: ICandidate[],
): ICandidate[];
export declare function mergeOptions<T>(pre: T[], cur: T[]): T[];
export interface IQueryProps {
  defaultQuery?: IQuery;
  resourceType?: string;
  needFuzzyQuery?: boolean;
  filteredKeys?: string[];
  excludeKeys?: string[];
  currentUser?: any;
  license?: any;
}
export { Link } from "./link";
export type { ILinkResource } from "./link";
export { useTagConfig } from "./use-tag-config";
export { useFuzzyConfig } from "./use-fuzzy-config";
export { useRemoteConfig } from "./use-remote-config";
