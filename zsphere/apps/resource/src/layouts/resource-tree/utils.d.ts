import React from "react";
import { IntlShape } from "react-intl";

import { LeftNavType, VirtualizationDirDataNode } from "./types";
export declare const updateExpandedKeys: (
  originKey: any,
  newKey: string,
  parentUuid: string,
  remove: boolean,
) => any;
export declare const tree2list: (tree: any) => any[];
export declare const getAllTreeKeysAfterRemoveNode: (
  tree: any,
  uuid: string,
) => string[];
export declare const getAllTreeKeys: (tree: any[]) => string[];
export declare const getAllParent: (treeData: any, nodeKey: string) => any;
export declare const findnode: (tree: any, uuid: string) => null;
export declare const changeResourceDirViewOptions: (
  intl: any,
  activeMenuKey: LeftNavType,
) => {
  value: string;
  label: any;
  iconType: string;
}[];
export declare const getMenuName: (key: any, intl: any) => any;
export type TreeData<T> = T & {
  children?: TreeData<T>[];
};
export interface VisitFnContext<T> {
  current: T;
  depth: number;
  shouldInclude: boolean;
}
export type VisitFn<T> = (ctx: VisitFnContext<T>) => boolean | void;
export declare function updateTreeData<T>(
  trees: TreeData<T>[],
  visits: VisitFn<TreeData<T>>[],
  depth?: number,
): TreeData<T>[];
export declare const findKey: (
  result: {
    value: boolean;
  },
  key: string | null | undefined,
) => ({
  current,
  shouldInclude,
}: VisitFnContext<VirtualizationDirDataNode>) => void;
export interface IFilterByOptions<
  T extends {
    titleNode?: React.ReactNode;
  },
> {
  field: (current: TreeData<T>) => string;
  keyword: string;
  className?: string;
}
export declare function filterBy<
  T extends {
    key: string;
    titleNode?: React.ReactNode;
  },
>({
  field,
  keyword,
  className,
}: IFilterByOptions<T>): ({ current }: VisitFnContext<TreeData<T>>) => boolean;
export declare function highlightText(
  text: string,
  keyword: string,
  className: string,
): import("react/jsx-runtime").JSX.Element;
export declare const collectExpandableKeys: (
  result: Set<string>,
) => ({ current }: VisitFnContext<VirtualizationDirDataNode>) => void;
export declare const collectKeysByDepth: (
  result: Set<string>,
  maxDepth: number,
) => ({ current, depth }: VisitFnContext<VirtualizationDirDataNode>) => void;
export declare const keySetLessThanOrEqual: (
  lhs: Set<string>,
  rhs: Set<string>,
) => boolean;
export declare function getName(
  intl: IntlShape,
  current: VirtualizationDirDataNode,
): string;
export declare const useSubscribeOrgTreeChange: (params: any) => void;
