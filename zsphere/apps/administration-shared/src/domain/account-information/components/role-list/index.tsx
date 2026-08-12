import { Text } from "@zstack/design";
import { ResourceName } from "@zstack/zsphere-components";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const STYLE_ROLE_LIST = { wordBreak: "keep-all" } as const;

interface RoleListProps {
  current: {
    role: IZsvRole[];
  };
  uuid: string;
  goToabstract: () => void;
}

//后端固定Legacy角色uuid
export const PREDEFINED_LEGACY_UUID = "85cfac2138494b2db6501881e1e68045";

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

const RoleList: React.FC<RoleListProps> = ({ current, uuid, goToabstract }) => {
  const intl = useIntl();
  const roleValue = useMemo(() => {
    if (!current?.role?.length) {
      return intl.formatMessage({ id: "none", defaultMessage: "None" });
    }

    return current.role.map((role: IZsvRole, index: number) => {
      const roleComponent =
        role.uuid === uuid ? (
          <a key={role.uuid} onClick={goToabstract}>
            <ResourceName
              value={transformRoleName(intl, {
                uuid: role.uuid,
                name: role.name,
              })}
              className={styles.link}
            />
          </a>
        ) : (
          <ResourceName
            className={styles.resourceName}
            key={role.uuid}
            value={transformRoleName(intl, {
              uuid: role.uuid,
              name: role.name,
            })}
            link={{
              uuid: role.uuid,
              to: "/role",
              microAppName: "virtualization-administration",
            }}
          />
        );

      return index === 0 ? (
        roleComponent
      ) : (
        <React.Fragment key={role.uuid}>
          <span>,</span> {roleComponent}
        </React.Fragment>
      );
    });
  }, [current.role, intl, uuid]);

  const tooltipTitle = useMemo(() => {
    return current.role.map((role: IZsvRole) => (
      <div key={role.uuid}>
        {role.uuid === uuid ? (
          <a onClick={goToabstract}>
            <ResourceName
              value={transformRoleName(intl, {
                uuid: role.uuid,
                name: role.name,
              })}
              className={styles.link}
            />
          </a>
        ) : (
          <ResourceName
            value={transformRoleName(intl, {
              uuid: role.uuid,
              name: role.name,
            })}
            link={{
              uuid: role.uuid,
              to: "/role",
              microAppName: "virtualization-administration",
            }}
          />
        )}
      </div>
    ));
  }, [current.role, intl, uuid]);

  return (
    <div style={STYLE_ROLE_LIST} className={styles.roleList}>
      <Text>
        <>{roleValue}</>
      </Text>
    </div>
  );
};

export default RoleList;
