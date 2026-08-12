import type { IListProps } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";
import { AccountPlainList } from "zsv_administration_shared/account-information/mf-index";

import { useActionConfig } from "../config";

interface IProps extends IListProps<IAccount> {
  toolbar?: string[];
}

const AccountList: React.FC<IProps> = ({ ...props }) => {
  const actionConfig = useActionConfig();

  return <AccountPlainList actionConfig={actionConfig} {...props} />;
};

export default AccountList;
