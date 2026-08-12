import { TableList } from "@zstack/zsphere-components";
import { useQueryConfig } from "@zstack/zsphere-engine/src/zsv-role";
import type { IListProps } from "@zstack/zsphere-types";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { zsvRoleList } from "../../../gql/role.gql";
import { useActionConfig, useColumnConfig } from "../config";
import { isPredefinedRole, transformRoleName } from "../utils";

const RoleList: React.FC<IListProps<IZsvRole>> = (props) => {
  const intl = useIntl();
  const [selectedList, setSelectedList] = useState<IZsvRole[]>([]);
  const queryConfig = useQueryConfig([], {
    resourceType: "ZSVRole",
    needFuzzyQuery: true,
  });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const handleChange = (role: IZsvRole[]) => {
    const transformSelectList = role?.map((it) =>
      isPredefinedRole(it.uuid)
        ? {
            ...it,
            name: transformRoleName(intl, { uuid: it.uuid, name: it.name }),
          }
        : it,
    );
    setSelectedList(transformSelectList);
  };

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={zsvRoleList}
      type="Role"
      resource="zsv.role"
      value={selectedList}
      onChange={handleChange}
      {...props}
    />
  );
};

export default RoleList;
