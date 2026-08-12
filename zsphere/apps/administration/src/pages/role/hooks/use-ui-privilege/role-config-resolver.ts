// Import UUID constants from shared utils instead of hardcoding
import {
  PREDEFINED_SOD_SYSTEM_ADMIN_UUID,
  PREDEFINED_SOD_SECURITY_ADMIN_UUID,
  PREDEFINED_SOD_AUDITOR_UUID,
  PREDEFINED_RESOURCE_VIEWER_UUID,
  PREDEFINED_LEGACY_UUID,
} from "zsv_administration_shared/role/utils";

// Import JSON configs for predefined roles
import IAM1ZSVAdmin from "../../auth/iam1/Admin.zsv.json";
import IAM1AuditAdmin from "../../auth/iam1/IAM1AuditAdmin.json";
import IAM1ResourceViewer from "../../auth/iam1/IAM1ResourceViewer.json";
import IAM1SecurityAdmin from "../../auth/iam1/IAM1SecurityAdmin.json";
import IAM1SystemAdmin from "../../auth/iam1/IAM1SystemAdmin.json";
import IAM1VirtualMachineUser from "../../auth/iam1/VirtualMachineUser.zsv.json";
import { NON_SOD_FILTER_CONFIG } from "./constants";
import type { RoleFilterConfig } from "./types";

/** UUID → role JSON config mapping */
const ROLE_CONFIG_MAP: Record<string, Record<string, string>> = {
  [PREDEFINED_SOD_SYSTEM_ADMIN_UUID]: IAM1SystemAdmin,
  [PREDEFINED_SOD_SECURITY_ADMIN_UUID]: IAM1SecurityAdmin,
  [PREDEFINED_SOD_AUDITOR_UUID]: IAM1AuditAdmin,
  [PREDEFINED_RESOURCE_VIEWER_UUID]: IAM1ResourceViewer,
  [PREDEFINED_LEGACY_UUID]: IAM1VirtualMachineUser,
};

/**
 * 根据角色UUID获取对应的权限JSON配置
 * @param roleUuid 角色UUID，空字符串或未匹配时使用默认管理员配置
 */
export const resolveRoleConfig = (roleUuid: string): Record<string, string> => {
  return ROLE_CONFIG_MAP[roleUuid] ?? IAM1ZSVAdmin;
};

/**
 * 获取角色类型对应的过滤配置
 * @param isSodOrViewer 是否为SOD角色或只读角色
 */
export const getRoleFilterConfig = (
  isSodOrViewer: boolean = false,
): RoleFilterConfig => {
  if (isSodOrViewer) {
    return {
      allowedActions: {},
      filteredActionKeys: [],
      filteredMenuKeys: [],
    };
  }
  return NON_SOD_FILTER_CONFIG;
};
