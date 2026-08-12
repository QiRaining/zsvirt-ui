import { keys as _keys } from "lodash-es";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { createKeyToMenuKeyMap } from "zsv_administration_shared/role/utils";

import {
  ADMIN_ONLY_RESOURCE_TYPES,
  VIRTUALIZATION_RESOURCE_TYPES,
} from "./constants";
import { resolveRoleConfig, getRoleFilterConfig } from "./role-config-resolver";
import type {
  BuildPrivilegeOptions,
  UIPrivilegeMap,
  PrivilegeAction,
  PrivilegeView,
} from "./types";
import { useActionRegistry } from "./use-action-registry";

/**
 * 核心权限构建 Hook
 * 从角色配置、License、操作配置中构建完整的UI权限映射
 */
export function usePrivilegeBuilder() {
  const intl = useIntl();
  const { actionConfig, customActionConfig } = useActionRegistry();
  const keyToMenuKeyMap = useMemo(() => createKeyToMenuKeyMap(), []);

  const buildPrivilegeMap = useCallback(
    ({ roleUuid, isSodOrViewer }: BuildPrivilegeOptions): UIPrivilegeMap => {
      const actionKeyList = resolveRoleConfig(roleUuid);
      const uiPrivilege: UIPrivilegeMap = {};

      const { allowedActions, filteredActionKeys } =
        getRoleFilterConfig(isSodOrViewer);

      const availableAuthKeys = _keys(actionKeyList).filter(
        (item: string) => !item.includes("||block"),
      );

      /**
       * 添加操作权限
       */
      const addActionPrivilege = (
        resourceType: string,
        actionKey: string,
        actionName: string,
      ) => {
        // 处理受限资源类型
        if (filteredActionKeys.includes(resourceType)) {
          const allowedActionList = allowedActions[resourceType] as string[];
          if (allowedActionList && allowedActionList.includes(actionKey)) {
            if (!uiPrivilege[resourceType]) {
              uiPrivilege[resourceType] = {
                actionKey: "",
                actions: [],
                viewKey: "",
                views: [],
              };
            }
            (uiPrivilege[resourceType].actions as PrivilegeAction[]).push({
              key: actionKey,
              name: actionName,
            });
          }
          return;
        }

        // 添加可用的操作权限
        if (
          availableAuthKeys.includes(`${resourceType}||action||${actionKey}`)
        ) {
          (uiPrivilege[resourceType].actions as PrivilegeAction[]).push({
            key: actionKey,
            name: actionName,
          });
        }
      };

      // 处理所有资源类型
      _keys(actionConfig).forEach((resourceType) => {
        uiPrivilege[resourceType] = {
          actionKey: "",
          actions: [],
          viewKey: "",
          views: [],
        };

        // SOD角色和只读角色可以查看所有资源类型的视图权限
        if (
          isSodOrViewer ||
          !ADMIN_ONLY_RESOURCE_TYPES.includes(resourceType)
        ) {
          const menuKey = keyToMenuKeyMap.get(resourceType);

          // 添加列表页视图权限
          if (availableAuthKeys.includes(`${menuKey}||view||list`)) {
            (uiPrivilege[resourceType].views as PrivilegeView[]).push({
              key: "list",
              name: intl.formatMessage({
                id: "listPage",
                defaultMessage: "List Page",
              }),
            });
            uiPrivilege[resourceType].viewKey = menuKey;
          }

          // 添加详情页视图权限
          if (availableAuthKeys.includes(`${menuKey}||view||detail`)) {
            (uiPrivilege[resourceType].views as PrivilegeView[]).push({
              key: "detail",
              name: intl.formatMessage({
                id: "detailPage",
                defaultMessage: "Details Page",
              }),
            });
          }
        }

        // 处理虚拟化资源类型
        if (VIRTUALIZATION_RESOURCE_TYPES.includes(resourceType)) {
          // 添加虚拟化操作权限
          _keys(actionConfig[resourceType]).forEach((actionKey) => {
            // 跳过VM的更改分组操作（admin only）
            if (
              resourceType === "vm" &&
              actionKey === "virtualization.change.group"
            ) {
              return;
            }

            if (actionKey.startsWith("virtualization.")) {
              addActionPrivilege(
                resourceType,
                actionKey,
                actionConfig[resourceType][actionKey],
              );
            }
          });

          // 添加自定义操作权限
          _keys(customActionConfig[resourceType]).forEach((actionKey) => {
            // 跳过VM的更新密钥操作（admin only）
            if (
              resourceType === "vm" &&
              actionKey === "update.data.encryption.key"
            ) {
              return;
            }
            addActionPrivilege(
              resourceType,
              actionKey,
              customActionConfig[resourceType][actionKey],
            );
          });
        } else {
          // 处理其他资源类型的操作权限
          _keys(actionConfig[resourceType]).forEach((actionKey) => {
            addActionPrivilege(
              resourceType,
              actionKey,
              actionConfig[resourceType][actionKey],
            );
          });
        }

        // 设置资源类型的操作键
        if (uiPrivilege[resourceType].actions.length > 0) {
          uiPrivilege[resourceType].actionKey = resourceType;
        }
      });

      return uiPrivilege;
    },
    [actionConfig, customActionConfig, keyToMenuKeyMap, intl],
  );

  return { buildPrivilegeMap };
}
