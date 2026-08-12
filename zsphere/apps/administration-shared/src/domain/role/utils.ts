import { getMenuTree } from "@zstack/zsphere-config";
import type { IMenu } from "@zstack/zsphere-types";
import { Identity } from "@zstack/zsphere-types";
import _ from "lodash-es";
import type { IntlShape } from "react-intl";

//后端固定Legacy角色uuid
export const PREDEFINED_LEGACY_UUID = "85cfac2138494b2db6501881e1e68045";

// otherUuid 后端固定角色uuid
export const PREDEFINED_OTHER_UUID = "80315b1f85314917826b182bf6def552";

// 系统管理员角色uuid
export const PREDEFINED_SOD_SYSTEM_ADMIN_UUID =
  "8550125df53c54edb33d1b8ae83ded55";

// 安全管理员角色uuid
export const PREDEFINED_SOD_SECURITY_ADMIN_UUID =
  "855013d87cf55944b4a6c6ae729b3f55";

// 审计员角色uuid
export const PREDEFINED_SOD_AUDITOR_UUID = "855014f1908759aca90f58ca56290955";

// 只读角色uuid
export const PREDEFINED_RESOURCE_VIEWER_UUID =
  "8550153cd5474c79850566787fe0f055";

export const isSodRole = (uuid: string): boolean => {
  return [
    PREDEFINED_SOD_SYSTEM_ADMIN_UUID,
    PREDEFINED_SOD_SECURITY_ADMIN_UUID,
    PREDEFINED_SOD_AUDITOR_UUID,
  ].includes(uuid);
};

export const isResourceViewerRole = (uuid: string): boolean => {
  return uuid === PREDEFINED_RESOURCE_VIEWER_UUID;
};

/**
 * 是否为 SOD 角色或只读角色（用于权限树展示等场景）
 */
export const isSodOrResourceViewerRole = (uuid: string): boolean => {
  return isSodRole(uuid) || isResourceViewerRole(uuid);
};

export const isPredefinedRole = (uuid: string): boolean => {
  return [
    PREDEFINED_LEGACY_UUID,
    PREDEFINED_SOD_SYSTEM_ADMIN_UUID,
    PREDEFINED_SOD_SECURITY_ADMIN_UUID,
    PREDEFINED_SOD_AUDITOR_UUID,
    PREDEFINED_RESOURCE_VIEWER_UUID,
  ].includes(uuid);
};
export const isVirtualMachineUserRole = (uuid: string): boolean => {
  return [PREDEFINED_LEGACY_UUID].includes(uuid);
};

export const SodRoleMap: Record<string, Identity> = {
  [PREDEFINED_SOD_SYSTEM_ADMIN_UUID]: Identity.IAM1SystemAdmin,
  [PREDEFINED_SOD_SECURITY_ADMIN_UUID]: Identity.IAM1SecurityAdmin,
  [PREDEFINED_SOD_AUDITOR_UUID]: Identity.IAM1AuditAdmin,
  [PREDEFINED_RESOURCE_VIEWER_UUID]: Identity.IAM1ResourceViewer,
};

export const transformRoleName = (
  intl: IntlShape,
  { uuid = "", name = "" }: any,
  transform: boolean = true,
): string => {
  const predefinedRoles: Map<string, string> = new Map([
    [
      PREDEFINED_LEGACY_UUID,
      transform
        ? intl.formatMessage({
            id: "virtualization.vm.user.role",
            defaultMessage: "VM User",
          })
        : intl.formatMessage({
            id: "virtualization.vm.user",
            defaultMessage: "VM User",
          }),
    ],
    [
      PREDEFINED_SOD_SYSTEM_ADMIN_UUID,
      transform
        ? intl.formatMessage({
            id: "virtualization.sod.system.admin.role",
            defaultMessage: "System Admin",
          })
        : intl.formatMessage({
            id: "virtualization.sod.system.admin",
            defaultMessage: "System Admin",
          }),
    ],
    [
      PREDEFINED_SOD_SECURITY_ADMIN_UUID,
      transform
        ? intl.formatMessage({
            id: "virtualization.sod.security.admin.role",
            defaultMessage: "Security Admin",
          })
        : intl.formatMessage({
            id: "virtualization.sod.security.admin",
            defaultMessage: "Security Admin",
          }),
    ],
    [
      PREDEFINED_SOD_AUDITOR_UUID,
      transform
        ? intl.formatMessage({
            id: "virtualization.sod.auditor.role",
            defaultMessage: "Auditor",
          })
        : intl.formatMessage({
            id: "virtualization.sod.auditor",
            defaultMessage: "Auditor",
          }),
    ],
    [
      PREDEFINED_RESOURCE_VIEWER_UUID,
      transform
        ? intl.formatMessage({
            id: "virtualization.resource.viewer.role",
            defaultMessage: "Read-Only Role",
          })
        : intl.formatMessage({
            id: "virtualization.resource.viewer",
            defaultMessage: "Read Only",
          }),
    ],
  ]);

  return predefinedRoles.get(uuid) || name;
};

export const renderDefaultTag = (intl: IntlShape, uuid: string): string => {
  return [
    PREDEFINED_LEGACY_UUID,
    PREDEFINED_SOD_SYSTEM_ADMIN_UUID,
    PREDEFINED_SOD_SECURITY_ADMIN_UUID,
    PREDEFINED_SOD_AUDITOR_UUID,
    PREDEFINED_RESOURCE_VIEWER_UUID,
  ].includes(uuid)
    ? intl.formatMessage({ id: "default", defaultMessage: "Default" })
    : "";
};

// 创建菜单的key到UI权限的key的映射
const createKeyToMenuKeyMap = () => {
  const menu = getMenuTree("root");
  const map = new Map();

  const processItem = (item: any, visited = new Set<string>()) => {
    // 防止循环引用
    if (visited.has(item.key)) {
      console.warn(
        `Circular reference detected in createKeyToMenuKeyMap for key: ${item.key}`,
      );
      return;
    }
    visited.add(item.key);

    map.set(item.menuKey, item.key);

    if (item.children) {
      item.children.forEach((child: any) => processItem(child, visited));
    }

    if (item.tabs) {
      item.tabs.forEach((tab: any) => processItem(tab, visited));
    }

    // 清理访问记录，允许其他路径访问
    visited.delete(item.key);
  };

  // 注意：forEach 会传入 (item, index, array)，因此需要包一层只传 item，避免把 index 传给 visited
  menu.forEach((item: any) => processItem(item));

  return map;
};

const transformUiPrivilege = (
  uiPrivilege: any,
  excludedCheckedKeys: readonly string[] = [],
) => {
  const results: any[] = [];
  const excludedCheckedKeySet = new Set(excludedCheckedKeys);
  //view权限根据 viewKey，action权限根据 actionKey
  _.forEach(uiPrivilege?.uiPrivilege, (value, key) => {
    if (
      uiPrivilege.checkedKeys.includes(key) &&
      !excludedCheckedKeySet.has(key)
    ) {
      results.push({
        resourceType: key,
        actionKey: key,
        viewKey: value.viewKey,
        effect: "allow",
        views: value.views
          .filter((view: any) => view.selected)
          .map((view: any) => view.key),
        actions: value.actions
          .filter((action: any) => action.selected)
          .map((action: any) => action.key),
      });
    }
  });
  return results;
};

function collectApis(data: any[]) {
  const allApis = data.reduce((acc, item) => {
    if (_.isArray(item.apiList)) {
      return acc.concat(item.apiList);
    }
    if (_.isObject(item.api)) {
      return acc.concat(_.values(item.api));
    }
    return acc;
  }, []);

  const selectedApis = _.filter(allApis, { selected: true });

  return {
    selectedApis: _.map(selectedApis, "api"),
  };
}

// 构建角色资源菜单树的顺序
const RESOURCE_MENU_ORDER_MAP: { [key: string]: number } = {
  "root.node": 1,
  zone: 2,
  cluster: 3,
  host: 4,
  "backup.storage": 5,
  "primary.storage": 6,
  image: 7,
  "l2.network": 8,
  "flat.network": 9,
  "security.group": 10,
  "vm.template": 11,
  "vm.dir.group": 12,
  vm: 13,
};

function sortNodes(a: any, b: any) {
  const orderA = RESOURCE_MENU_ORDER_MAP[a.key] || Infinity;
  const orderB = RESOURCE_MENU_ORDER_MAP[b.key] || Infinity;
  return orderA - orderB;
}

interface TreeBuilderOptions {
  filteredMenuKeys?: string[];
  getNodeTitle: (node: any) => React.ReactNode | null;
  isDashboardDisabled?: boolean;
}

const buildPrivilegeTree = (
  treeStruct: IMenu[],
  options: TreeBuilderOptions,
) => {
  const {
    filteredMenuKeys,
    getNodeTitle,
    isDashboardDisabled = true,
  } = options;

  const buildTreeNode = (data: any, visited = new Set<string>()): any => {
    // 防止循环引用
    if (visited.has(data.key)) {
      console.warn(
        `Circular reference detected in buildPrivilegeTree for key: ${data.key}`,
      );
      return null;
    }
    visited.add(data.key);

    try {
      // 如果当前节点的 menuKey 在 filterMenuKeys 中，返回 null
      if (filteredMenuKeys?.includes(data.menuKey)) {
        return null;
      }

      const processChildren = (children: any[]) =>
        _.uniqBy(
          children.reduce((acc, item: any) => {
            const mappedChildren = _.map(item.children || [], (child: any) => {
              // 如果子节点的 menuKey 在 filterMenuKeys 中，跳过这个子节点
              if (filteredMenuKeys?.includes(child.menuKey)) {
                return null;
              }

              return getNodeTitle(child) === null
                ? null
                : {
                    title: getNodeTitle(child),
                    key: child.menuKey,
                  };
            }).filter(Boolean); // 过滤掉 null 值

            return acc.concat(mappedChildren);
          }, []),
          "key",
        );

      if (data?.children?.length || data?.tabs?.length) {
        const result: any = {
          key: data.menuKey,
          title: data.name,
          children: [],
        };

        if (data.menuKey === "resource") {
          result.children = processChildren(data.children || []);
        } else {
          result.children = (data.children || data.tabs || [])
            .map((child: any) => buildTreeNode(child, visited))
            .filter(Boolean); // 过滤掉 null 值
        }

        // 只有在有子节点的情况下才进行排序
        if (result.children.length > 0) {
          result.children.sort(sortNodes);
          return result;
        }

        return null; // 如果没有子节点，直接返回 null
      }

      const nodeTitle = getNodeTitle(data);
      if (nodeTitle === null) {
        return null;
      }

      return {
        key: data.menuKey,
        title: nodeTitle,
        ...(isDashboardDisabled && data.menuKey === "dashboard"
          ? { disabled: true }
          : {}),
      };
    } finally {
      // 清理访问记录，允许其他路径访问
      visited.delete(data.key);
    }
  };

  // 注意：map 会传入 (item, index, array)，需要包一层只传 item，避免把 index 传给 visited
  return treeStruct
    .map((item: any) => buildTreeNode(item))
    .filter(Boolean)
    .sort(sortNodes); // 过滤掉 null 值
};

export {
  createKeyToMenuKeyMap,
  transformUiPrivilege,
  collectApis,
  sortNodes,
  buildPrivilegeTree,
};
