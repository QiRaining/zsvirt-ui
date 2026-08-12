import type { IListProps } from "@zstack/zsphere-types";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { UserGroupPlainList } from "zsv_administration_shared/account-information/mf-index";

import { useActionConfig } from "../config";

interface IProps extends IListProps<IUserGroup> {
  toolbar?: string[];
}

const UserGroupList: React.FC<IProps> = (props) => {
  const actionConfig = useActionConfig();

  return <UserGroupPlainList actionConfig={actionConfig} {...props} />;
};

export default UserGroupList;
