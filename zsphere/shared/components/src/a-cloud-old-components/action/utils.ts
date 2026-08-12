import { Item } from "@zstack/zsphere-types";
import { isElement, cloneDeepWith, difference } from "lodash-es";
import React from "react";

import { IProps } from "../auth/type";
import { IFlatActionMap, IActionProps, IMenuItem, IViewMapKey } from "./type";

export function cloneDeep<T>(value: T): T {
  return cloneDeepWith(value, (item: any) => {
    if (React.isValidElement(item)) {
      return React.cloneElement(item);
    }
    if (isElement(item)) {
      return (item as Element).cloneNode(true);
    }
  });
}

// 通过递归获取操作上的 auth 字段信息
export function findAuthByKey<T extends Item>(
  key: string,
  menuList: IActionProps<T>["menuList"] = [],
): IProps | undefined {
  for (const iterator of menuList) {
    if (iterator.children?.length) {
      const auth = findAuthByKey(key, iterator.children);

      if (auth) {
        return auth;
      }
    } else if (key === iterator.key) {
      return iterator.auth;
    }
  }
}

export function resetValid<T>(f: IFlatActionMap<T>): IFlatActionMap<T> {
  return Object.fromEntries(
    Object.entries(f).map(([key, value]) => [
      key,
      {
        ...value,
        valid: !value.preValidators?.length && !value.validators?.length,
        preValid: true,
      },
    ]),
  );
}

export async function verifyAll<T>(
  flatActionMap: IFlatActionMap<T>,
  selectedList: T[],
): Promise<IFlatActionMap<T>> {
  const newFlatActionMap: IFlatActionMap<T> = cloneDeep(
    resetValid(flatActionMap),
  );

  // 用 for ... of 处理异步时只能单个执行，性能较差，此处考虑异步校验较少，方便代码书写
  // 前置校验，与运算，接收 selectedList 作为参数
  try {
    await Promise.all(
      Object.entries(newFlatActionMap).map(async ([key, action]) => {
        // 禁用时，不执行校验
        if (action.disabled) {
          return;
        }

        if (!action.preValidators) {
          // 没有预校验器,预校验结果直接设为true
          newFlatActionMap[key].preValid = true;
          return;
        }

        const promiseArray = action.preValidators.map((preValidator) =>
          preValidator(selectedList, action.source),
        );

        const results = await Promise.all(promiseArray);
        const preValid = results.every((current) => !!current);

        newFlatActionMap[key].preValid = preValid;

        if (!selectedList.length) {
          newFlatActionMap[key].valid = preValid;
        }
      }),
    );

    if (!selectedList?.length) {
      return newFlatActionMap;
    }

    // 单个校验，或运算，即只要有一个选中有效，按钮就亮（在前置校验通过后执行）
    await Promise.all(
      selectedList.reduce<Array<Promise<any>>>((tasks, item) => {
        const currentTasks =
          Object.entries(newFlatActionMap).map(async ([key, action]) => {
            if (action.disabled || !action.preValid || action.valid) {
              return;
            }

            if (!action.validators) {
              newFlatActionMap[key].valid = true;

              return;
            }

            const promiseArray = action.validators.map((validator) =>
              validator(item, action.source, selectedList),
            );

            const results = await Promise.all(promiseArray);
            const currentValid = results.reduce(
              (result, current) => result && current,
              true,
            );

            newFlatActionMap[key].valid =
              newFlatActionMap[key].valid || currentValid;
          }) ?? [];

        return [...tasks, ...currentTasks];
      }, []),
    );
  } catch (e) {
    console.error(e);
  }

  return newFlatActionMap;
}

export function initFlatActionMap<T>({
  menuList,
  keys,
  source,
}: {
  menuList: Array<IMenuItem<T>>;
  keys: string[];
  source?: any;
}): IFlatActionMap<T> {
  // 预校验长度
  const length = (_selectedList: T[]) => _selectedList.length > 0;

  function init<T>(actions: Array<IMenuItem<T>>): IFlatActionMap<T> {
    return actions.reduce((prev, item: IMenuItem<T>) => {
      const autoInjectPreValidator = item.autoInjectPreValidator ?? true;

      const preValidators = [
        ...(item.preValidators || []),
        ...(autoInjectPreValidator ? [length] : []),
      ];

      const currentItem = {
        [item.key]: {
          visible: false,
          preValid: false,
          valid: false,
          shouldRender: false,
          preValidators,
          validators: item.validators,
          ActionWrapper: item.ActionWrapper,
          name: item.name,
          icon: item.icon,
          onClick: item.onClick,
          key: item.key,
          extraRender: item.extraRender,
          primary: item.primary,
          source,
          auth: item.auth,
          disabled: item.disabled ?? false,
          trigger: item.trigger || "disable",
          tooltip: item?.tooltip,
          tooltipPlacement: item?.tooltipPlacement || "topRight",
          notSupportedModal: item.notSupportedModal,
          iconStyle: item?.iconStyle,
          defaultShowTooltip: item?.defaultShowTooltip ?? false,
        },
      };

      if ("children" in item) {
        const children = init(item.children!);

        if (Object.keys(children).length) {
          return {
            ...prev,
            ...currentItem,
            ...children,
          };
        }

        return prev;
      }
      return {
        ...prev,
        ...(keys.includes(item.key) ? currentItem : null),
      };
    }, {});
  }
  return init(menuList);
}

export function mergeActionMap<T>(
  newActionMap: IFlatActionMap<T>,
  oldActionMap: IFlatActionMap<T>,
): IFlatActionMap<T> {
  return Object.entries(oldActionMap ?? {}).reduce(
    (prev, [key, action]) =>
      key in prev
        ? {
            ...prev,
            [key]: {
              ...prev?.[key],
              shouldRender: action.shouldRender,
              visible: action.visible,
            },
          }
        : prev,
    newActionMap,
  );
}

function getKeys<T>(menuList: Array<IMenuItem<T>>): string[] {
  function init<T>(actions: Array<IMenuItem<T>>): string[] {
    return actions.reduce<string[]>(
      (prev, item: IMenuItem<T>) => [
        ...prev,
        item.key,
        ...(item.children ? init(item.children) : []),
      ],
      [],
    );
  }

  return init(menuList);
}

export function getActiveKeys<T>({
  menuList,
  view,
  activeKeys,
  viewMap,
  extraKeys,
  ...params
}: Pick<IActionProps<T>, "menuList" | "position" | "activeKeys" | "viewMap"> & {
  view: string;
  extraKeys: string[];
}) {
  const position = view.startsWith("select") ? undefined : params.position;

  const viewMapKey = position ? `${view}/${position}` : view;

  const keys = getKeys(menuList);

  if (activeKeys === false) {
    return [];
  }

  const { activeKeys: a } = Array.isArray(activeKeys)
    ? { activeKeys }
    : (viewMap?.[viewMapKey as IViewMapKey] ?? {});

  return Array.isArray(a) ? a : difference(keys, extraKeys);
}
