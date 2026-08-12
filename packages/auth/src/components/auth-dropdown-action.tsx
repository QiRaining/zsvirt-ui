import type { DropdownItem } from "@zstack/design";
import { Button, Dropdown, Icon, InfoPopover, SmartTip } from "@zstack/design";
import { useUIConfig, UIConfigType } from "@zstack/hooks";
import type { IconTypes } from "@zstack/icon";
import { cn } from "@zstack/utils";
import type { ReactNode } from "react";
import React, { useMemo, useState } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

import { useAuth } from "../hooks/use-auth.ts";

export interface ActionDialogProps<T> {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: T[];
  setSelectedList?: (selectedList: T[]) => void;
  refetch?: () => void;
  view?: string;
  postAction?: () => void;
  clearSelection?: () => void;
  source?: unknown;
}

export type AuthAction<T> = {
  key: string;
  resource: string;
  authKey: string;
  i18nKey: string;
  name: string;
  icon: IconTypes;
  dividerKey: number;
  disabled?: boolean;
  hasChildren?: boolean;
  children?: AuthAction<T>[];
  actionWrapper?: React.FC<ActionDialogProps<T>>;
  onClick?: (selectedList: T[]) => void;
  renderTooltip?: React.ReactNode | ((selectedList: T[]) => React.ReactNode);
  validator?: (selectedList: T[]) => boolean;
  primary?: boolean;
  info?: React.ReactNode;
  isExtra?: boolean; // 后端标记是否为 extraKey（独立按钮 vs 下拉菜单）
};

export interface CustomActionConfig<T> {
  key: string;
  actionWrapper?: React.FC<ActionDialogProps<T>>;
  validator?: (selectedList: T[]) => boolean;
  onClick?: (selectedList: T[]) => void;
  primary?: boolean;
  renderTooltip?: React.ReactNode | ((selectedList: T[]) => React.ReactNode);
  /** 问号图标 */
  info?: React.ReactNode;
}

interface ActionConfig<T = unknown> {
  viewMap: Array<{
    view: string;
    activeKeys?: string[];
    extraKeys?: string[];
  }>;
  actions: AuthAction<T>[];
}

// 后端直接返回 actions 数组
type FilteredActionConfig<T = unknown> = AuthAction<T>[];

export interface AuthDropdownActionProps<T> {
  /** 手动传入的 action 配置（旧方式，向后兼容） */
  actionConfig?: ActionConfig<T>;
  /** 自定义 action 配置 */
  customActionConfig?: CustomActionConfig<T>[];
  /** 当前视图 */
  view: string;
  /** 自定义触发器 */
  children?: React.ReactNode;
  /** 选择回调 */
  onSelect?: (action: AuthAction<T>) => void;
  /** 选中的列表项 */
  selectedList: T[];
  /** 刷新数据 */
  refetch: () => void;
  /** 操作后回调 */
  postAction?: () => void;
  /** 自定义按钮文本 */
  text?: React.ReactNode;
  /** 自定义样式 */
  className?: string;
  /** 资源类型，用于自动从 BFF 获取配置 */
  type?: string;
  /** 资源标识，用于权限过滤（可选，如果不传则从 type 推导） */
  resource?: string;
}

function mergeActions<T>(
  defaultActions: AuthAction<T>[],
  customActionConfig: CustomActionConfig<T>[],
): AuthAction<T>[] {
  return defaultActions.map((defaultAction) => {
    const userOption = customActionConfig.find(
      (option) => option.key === defaultAction.key,
    );

    // 基础合并
    const mergedAction = userOption
      ? {
          ...defaultAction,
          ...userOption,
        }
      : defaultAction;

    // 如果有子菜单，递归处理
    if (defaultAction.children && defaultAction.children.length > 0) {
      return {
        ...mergedAction,
        children: mergeActions(defaultAction.children, customActionConfig),
      };
    }

    return mergedAction;
  });
}

// 很复杂的组装逻辑，大体逻辑就是把扁平的结构组装成树状结构，下面这段让claude写的
function convertToDropdownItems<T>(
  intl: IntlShape,
  actions: AuthAction<T>[],
): DropdownItem[] {
  const result: DropdownItem[] = [];
  let currentGroup: DropdownItem | null = null;
  let groupStartIndex = 0;

  actions.forEach((action, index) => {
    const item: DropdownItem = {
      key: action.key,
      type: "item",
      label: (
        <div className="flex items-center">
          {intl.formatMessage({
            id: action.i18nKey,
            defaultMessage: action.name,
          })}
          {action.info ? (
            <InfoPopover content={action.info} triggerMode="hover" />
          ) : null}
        </div>
      ),
      tooltip: action.renderTooltip as ReactNode,
      disabled: action.disabled,
      onClick: action.onClick,
      actionWrapper: action.actionWrapper,
    };

    if (action.hasChildren && action.children) {
      item.children = convertToDropdownItems(intl, action.children);
    }

    if (action.dividerKey && action.dividerKey !== 0) {
      if (index > groupStartIndex) {
        currentGroup = {
          key: `group-${groupStartIndex}-${index}`,
          type: "group",
          label: actions[groupStartIndex].name,
          children: actions.slice(groupStartIndex, index + 1).map((a) => ({
            key: a.key,
            type: "item" as const,
            label: (
              <div className="flex items-center">
                {intl.formatMessage({
                  id: a.i18nKey,
                  defaultMessage: a.name,
                })}
                {a.info ? (
                  <InfoPopover content={a.info} triggerMode="hover" />
                ) : null}
              </div>
            ),
            tooltip: a.renderTooltip as ReactNode,
            disabled: a.disabled,
            onClick: a.onClick,
            actionWrapper: a.actionWrapper,
            children:
              a.hasChildren && a.children
                ? convertToDropdownItems(intl, a.children)
                : undefined,
          })),
        };
        result.push(currentGroup);
      } else {
        result.push(item);
      }
      groupStartIndex = index + 1;
    } else if (index === actions.length - 1) {
      if (index > groupStartIndex) {
        currentGroup = {
          key: `group-${groupStartIndex}-${index}`,
          type: "group",
          label: actions[groupStartIndex].name,
          children: actions.slice(groupStartIndex).map((a) => ({
            key: a.key,
            type: "item" as const,
            label: (
              <div className="flex items-center">
                {intl.formatMessage({
                  id: a.i18nKey,
                  defaultMessage: a.name,
                })}
                {a.info ? (
                  <InfoPopover content={a.info} triggerMode="hover" />
                ) : null}
              </div>
            ),
            tooltip: a.renderTooltip as ReactNode,
            disabled: a.disabled,
            onClick: a.onClick,
            actionWrapper: a.actionWrapper,
            children:
              a.hasChildren && a.children
                ? convertToDropdownItems(intl, a.children)
                : undefined,
          })),
        };
        result.push(currentGroup);
      } else {
        result.push(item);
      }
    }
  });

  return result;
}

export const AuthDropdownAction = <T,>({
  actionConfig: manualActionConfig,
  customActionConfig = [],
  view,
  children,
  onSelect,
  selectedList,
  refetch,
  postAction,
  text,
  className,
  type,
  // resource 参数保留用于未来扩展，当前未使用
}: AuthDropdownActionProps<T>) => {
  const { hasAuth } = useAuth();
  const intl = useIntl();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // 自动从 BFF 获取配置（如果未手动提供）
  const {
    data: fetchedActionConfig,
    loading: configLoading,
    error: configError,
  } = useUIConfig<FilteredActionConfig<T>>({
    configType: UIConfigType.ACTION,
    resourceKey: type || "",
    view: view, // 传递 view 参数，后端会根据 view 过滤
    manualConfig: undefined,
    immediate: !manualActionConfig && !!type,
  });

  const [activeItems, extraActions, filteredActions] = useMemo(() => {
    let sourceActions: AuthAction<T>[];
    let activeKeys: string[] | undefined;
    let extraKeys: string[] | undefined;

    // 使用手动配置
    if (manualActionConfig) {
      const { viewMap, actions } = manualActionConfig;
      const currentView = viewMap.find((v) => v.view === view);

      if (!currentView) {
        return [[], [], []];
      }

      activeKeys = currentView.activeKeys || [];
      extraKeys = currentView.extraKeys || [];
      const allowedKeys = [...activeKeys, ...extraKeys];

      // 手动配置需要前端根据 view 过滤
      sourceActions = actions.filter((action) =>
        allowedKeys.includes(action.key),
      );
    }
    // 使用后端自动获取的配置（已过滤）
    else if (fetchedActionConfig) {
      sourceActions = fetchedActionConfig; // 后端直接返回数组，直接使用
    } else {
      return [[], [], []];
    }

    // 合并自定义配置
    const mergedActions = mergeActions(sourceActions, customActionConfig);

    // 权限过滤 + 状态处理
    const processedActions = mergedActions
      .reduce<AuthAction<T>[]>((acc, action) => {
        if (action.children && action.children.length > 0) {
          // 递归过滤子项
          const filteredChildren = action.children.filter((child) =>
            hasAuth({
              type: "action",
              authKey: child.authKey,
              resource: child.resource,
            }),
          );
          // 如果过滤后的子项数量 > 0，保留父项
          if (filteredChildren.length > 0) {
            acc.push({
              ...action,
              children: filteredChildren,
            });
          }
        } else if (
          hasAuth({
            type: "action",
            authKey: action.authKey,
            resource: action.resource,
          })
        ) {
          // 对没有子项的action进行权限检查，有权限则添加
          acc.push(action);
        }
        return acc;
      }, [])
      .map((action) => ({
        ...action,
        disabled:
          (!action.primary && selectedList.length === 0) || // 只有非 primary 的按钮才需要检查 selectedList
          action.disabled ||
          Boolean(action.validator && !action.validator(selectedList)) ||
          false,
        renderTooltip:
          typeof action.renderTooltip === "function"
            ? action.renderTooltip(selectedList)
            : action.renderTooltip,
      }));

    // 根据 isExtra 标记区分（后端自动配置）或 activeKeys/extraKeys（手动配置）
    let activeActions: AuthAction<T>[];
    let extraActionsFiltered: AuthAction<T>[];

    if (activeKeys || extraKeys) {
      // 手动配置：使用 activeKeys/extraKeys
      activeActions = processedActions.filter((action) =>
        activeKeys?.includes(action.key),
      );
      extraActionsFiltered = processedActions.filter((action) =>
        extraKeys?.includes(action.key),
      );
    } else {
      // 后端自动配置：使用 isExtra 标记
      activeActions = processedActions.filter((action) => !action.isExtra);
      extraActionsFiltered = processedActions.filter(
        (action) => action.isExtra,
      );
    }

    const activeDropdownItems = convertToDropdownItems(intl, activeActions);

    return [activeDropdownItems, extraActionsFiltered, processedActions];
  }, [
    manualActionConfig,
    fetchedActionConfig,
    view,
    hasAuth,
    intl,
    selectedList,
    customActionConfig,
  ]);

  // 加载中状态
  if (!manualActionConfig && configLoading) {
    return null;
  }

  // 错误处理
  if (!manualActionConfig && configError) {
    console.error("Failed to load action config:", configError);
    return null;
  }

  // 没有配置（自动获取模式下，如果没有数据则不渲染）
  if (!manualActionConfig && !fetchedActionConfig) {
    return null;
  }

  const findActionByKey = (
    actions: AuthAction<T>[],
    key: string,
  ): AuthAction<T> | undefined => {
    for (const action of actions) {
      if (action.key === key) {
        return action;
      }
      if (action.children && action.children.length > 0) {
        const found = findActionByKey(action.children, key);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  const flattenActions = (actions: AuthAction<T>[]): AuthAction<T>[] => {
    return actions.reduce<AuthAction<T>[]>((acc, action) => {
      acc.push(action);
      if (action.children && action.children.length > 0) {
        acc.push(...flattenActions(action.children));
      }
      return acc;
    }, []);
  };

  const handleSelect = (item: DropdownItem) => {
    const selectedAction = findActionByKey(
      filteredActions,
      item.key.toString(),
    );
    if (selectedAction) {
      if (selectedAction.actionWrapper) {
        setActiveDialog(selectedAction.key);
      } else if (selectedAction.onClick) {
        selectedAction.onClick(selectedList);
      } else if (onSelect) {
        onSelect(selectedAction);
      }
    }
  };

  const setVisible = (visible: boolean) => {
    if (!visible) {
      setActiveDialog(null);
    }
  };

  return (
    <>
      <div className={cn("flex h-8 items-center gap-2", className)}>
        {extraActions?.map((item) => {
          const buttonElement = (
            <Button
              key={item.key}
              variant={item.primary ? "primary" : "secondary"}
              onClick={() => {
                handleSelect(item);
              }}
              disabled={item.disabled}
            >
              {item.icon && <Icon type={item.icon} className="mr-1" />}
              {intl.formatMessage({
                id: item.i18nKey,
                defaultMessage: item.name,
              })}
            </Button>
          );

          // 使用 SmartTip 智能选择 Tooltip 或 InfoPopover
          return item.renderTooltip ? (
            <SmartTip
              key={item.key}
              content={item.renderTooltip as ReactNode}
              popoverTriggerMode="hover"
              infoIconMode="replace"
            >
              <span>{buttonElement}</span>
            </SmartTip>
          ) : (
            buttonElement
          );
        })}
        <Dropdown items={activeItems} onSelect={handleSelect} align="end">
          {activeItems.length > 0 &&
            (children || (
              <Button
                variant="secondary"
                data-testid="more-actions-dropdown-button"
                className="data-[state=open]:bg-neutral-300"
              >
                <div className="mr-1">
                  {text ||
                    intl.formatMessage({
                      id: "more.action",
                      defaultMessage: "更多操作",
                    })}
                </div>
                <Icon type="arrow-ios-down" />
              </Button>
            ))}
        </Dropdown>
      </div>

      {flattenActions(filteredActions).map((action) => {
        if (action.actionWrapper) {
          const DialogComponent = action.actionWrapper;
          if (activeDialog === action.key) {
            return (
              <DialogComponent
                key={action.key}
                visible={activeDialog === action.key}
                setVisible={setVisible}
                selectedList={selectedList}
                refetch={refetch}
                view={view}
                postAction={postAction}
              />
            );
          }
        }
        return null;
      })}
    </>
  );
};
