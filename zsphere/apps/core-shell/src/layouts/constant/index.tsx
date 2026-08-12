import { Identity } from "@zstack/zsphere-types";
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

export const SodRoleMap: Record<string, Identity> = {
  [PREDEFINED_SOD_SYSTEM_ADMIN_UUID]: Identity.IAM1SystemAdmin,
  [PREDEFINED_SOD_SECURITY_ADMIN_UUID]: Identity.IAM1SecurityAdmin,
  [PREDEFINED_SOD_AUDITOR_UUID]: Identity.IAM1AuditAdmin,
  [PREDEFINED_RESOURCE_VIEWER_UUID]: Identity.IAM1ResourceViewer,
};

/**
 * 判断是否为三权分立（SOD）角色：系统管理员、安全管理员、审计管理员
 * 注意：只读角色（ResourceViewer）不属于 SOD 角色，不要加到这里
 */
export const isSodRole = (uuid: string): boolean => {
  return [
    PREDEFINED_SOD_SYSTEM_ADMIN_UUID,
    PREDEFINED_SOD_SECURITY_ADMIN_UUID,
    PREDEFINED_SOD_AUDITOR_UUID,
  ].includes(uuid);
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
