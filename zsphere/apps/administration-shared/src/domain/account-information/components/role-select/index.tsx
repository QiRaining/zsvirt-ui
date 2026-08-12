import { useQuery } from "@apollo/client";
import { Form, Select } from "@zstack/zsphere-components";
import type { Condition as ICondition } from "@zstack/zsphere-types";
import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { zsvRoleList } from "../../../../../gql/role.gql";
import { renderDefaultTag, transformRoleName } from "../../../role/utils";

import style from "./style.module.less";

export interface ISelectRoleProps {
  isCreate?: boolean;
  form?: any;
  multiple?: boolean;
}

const SelectRole: React.FC<ISelectRoleProps> = ({
  isCreate,
  form,
  multiple = false,
}) => {
  const intl = useIntl();

  useEffect(() => {
    if (isCreate) {
      form?.setFieldsValue({ roleUuids: undefined });
    }
  }, [isCreate, form?.getFieldsValue("type")]);

  const { data: roleData } = useQuery(zsvRoleList, {
    fetchPolicy: "network-only",
    variables: {
      type: multiple
        ? ZsvRoleQueryType.GET_ROLE_FOR_MANAGEMENT_WITH_ACCOUNT_AND_USERGROUP
        : ZsvRoleQueryType.GET_ROLE_FOR_MANAGEMENT_WITH_PREDEFINED_SYSTEM_ACCOUNT,
      conditions: [] as ICondition[],
    },
  });

  const roleList: IZsvRole[] = useMemo(
    () => roleData?.zsvRoleList?.list ?? [],
    [roleData],
  );

  const options = useMemo(
    () =>
      roleList.map((role) => ({
        label: transformRoleName(intl, { uuid: role?.uuid, name: role?.name }),
        value: role.uuid,
        extra: multiple && (renderDefaultTag(intl, role.uuid) as any),
      })),
    [intl, multiple, roleList],
  );

  return (
    <Form.Item
      name="roleUuids"
      label={intl.formatMessage({
        id: "role",
        defaultMessage: "Role",
      })}
      auth={{
        type: "view",
        resource: "virtualization.role",
        authKey: "list",
      }}
      icon="info"
      iconTooltip={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "role.tooltip",
            defaultMessage: "### Role\n\nAssign roles to a user. The assignment determines the permissions the user has within the platform.\n\n- A user can be assigned one or more roles.\n- When a user is assigned multiples roles, the user will have a combined set of permissions from all those roles.\n- When a user joins a user group, the user will inherit the roles from that group in addition to its already assigned roles.\n- An admin user can only be assigned one role.\n\nPredefined Roles\n\n- Predefined roles for regular users:\n  - VM User: Supports regular users in creating virtual machines and basic VM management.\n- Predefined roles for admin users:\n  - System Admin: Manages daily system operations and maintenance.\n  - Security Admin: Manages users, security policies, and security attributes.\n  - Auditor: Manages system event information and auditing.\n  - Read-Only Role: Has read-only access to system resources without write permissions.",
          })}
        </ReactMarkdown>
      }
    >
      {multiple ? (
        <Select
          className={style.roleSelect}
          mode="multiple"
          width="l"
          checkable
          virtual={false}
          options={options}
        />
      ) : (
        <Select
          className={style.roleSelect}
          width="l"
          options={options}
          allowClear
        />
      )}
    </Form.Item>
  );
};

export default SelectRole;
