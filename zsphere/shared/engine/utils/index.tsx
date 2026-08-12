import { Constant } from "@zstack/design";
import type { IColumnType as ColumnType } from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { Op } from "@zstack/zsphere-types";
import { produce } from "immer";
import * as _ from "lodash-es";
import React from "react";

import { ILinkResource } from "./link";
import { ICandidate } from "./types";

export interface Condition {
  key: string;
  value?: string | number | boolean;
  values?: (string | number | boolean)[];
  op?: Op;
}

export type IColumnEmptyType = "notSupport" | "notConfig";

export const actionKey = "__action__" as const;

export interface Item {
  [prop: string]: any;
}

export type IKey<T extends Item> = keyof T | typeof actionKey;

export interface IColumnType<T extends Item = any> extends ColumnType<T> {
  key: string;
  linkResource?: ILinkResource;
  formatter?: (value: T) => any;
  primaryKey?: string;
  filterOptions?: { [key: string]: string | number };
  filterEnumType?: string;
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

export function getOption<T extends Item = any>(
  key: string,
  options: IColumnType<T>[],
) {
  return options.find((cv) => cv.key === key);
}

export const defaultFormatter = (value: any, key: string) => {
  if (Array.isArray(value)) {
    console.error(`[useConfig]: please provide a formatter for key ${key}`);
    return null;
  }
  if (typeof value === "object") {
    return value?.name;
  }
  return value;
};

export function formatValue<T extends Item = any>(
  key: string,
  value: any,
  options: IColumnType<T>[],
) {
  if (getOption(key, options)?.formatter) {
    return getOption(key, options)?.formatter?.(value);
  }
  return defaultFormatter(value?.[key], key);
}

export function formatLinkUuid<T extends Item = any>(
  key: string,
  value: any,
  options: IColumnType<T>[],
) {
  const primaryKey = getOption(key, options)?.primaryKey || "uuid";
  if (typeof value?.[key] === "object") {
    return _.get(value?.[key], primaryKey);
  }
  return _.get(value, primaryKey);
}

export function handleColumnList<T extends { [prop: string]: any }>(
  options: IColumnType<T>[],
  list: IColumnType<T>[],
) {
  const newColumnList = options.reduce((columnList, option) => {
    const targetIndex = list.findIndex((cv) => cv.key === option.key);

    if (targetIndex === -1) {
      return columnList;
    }

    return produce(columnList, (draft: IColumnType<T>[]) => {
      if (option.filterOptions) {
        // @ts-ignore
        draft[targetIndex].filters = Object.keys(option.filterOptions).map(
          (key) => ({
            value: key,
            text: (
              <Constant
                value={key as ConstantEnum}
                enumType={option.filterEnumType as ConstantType}
              />
            ),
          }),
        );
      }

      draft[targetIndex] = { ...draft[targetIndex], ...option };
    });
  }, list);

  const action = options.find((cv) => cv.key === "__action__");

  return action ? [...newColumnList, action] : newColumnList;
}

export function handleActionList(options: IOption[], list: IOption[]) {
  const getPathname = (
    items: IOption[],
    key: string,
  ): Array<string | number> | undefined => {
    for (let i = 0; i <= items.length - 1; i += 1) {
      if (items[i].children?.length) {
        const pathname = getPathname(items[i].children!, key);

        if (pathname?.length) {
          return [i, "children", ...pathname];
        }
      }

      if (items[i].key === key) {
        return [i];
      }
    }
  };

  return options.reduce((actionList, option) => {
    const { key } = option;

    const pathname = getPathname(actionList, key);

    if (!pathname?.length) {
      return actionList;
    }

    return produce(actionList, (draft) => {
      _.set(draft, pathname, { ..._.get(draft, pathname), ...option });
    });
  }, list);
}

export function mergeCandidates(source: ICandidate[], target: ICandidate[]) {
  const candidatesMap = new Map<string, ICandidate>();
  source.forEach((item) => {
    candidatesMap.set(item.key, item);
  });
  target.forEach((item) => {
    const sourceItem = candidatesMap.get(item.key);
    if (sourceItem) {
      const newItem = { ...sourceItem, ...item };
      candidatesMap.set(item.key, newItem);
    }
  });
  const result = Array.from(candidatesMap.values());
  return result;
}

export function concatCandidates(source: ICandidate[], target: ICandidate[]) {
  return _.concat(source, target);
}

// Optionsmerge，重复数据取后者的值
export function mergeOptions<T>(pre: T[], cur: T[]) {
  return cur.concat(_.differenceBy(pre, cur, "key"));
}

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

export type { ICandidate } from "./types";
export { useTagConfig } from "./use-tag-config";
export { useFuzzyConfig } from "./use-fuzzy-config";
export { useRemoteConfig } from "./use-remote-config";
