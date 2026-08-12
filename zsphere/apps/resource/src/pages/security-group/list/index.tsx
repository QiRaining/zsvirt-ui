import type { IListProps } from "@zstack/zsphere-types";
import type {
  SecurityGroup as ISecurityGroup,
  Zone as IZone,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { SecurityGroupPlainList } from "zsv_resource_shared/security-group/mf-index";

import { securityGroupListForSelect } from "../../../gql/security-group.gql";
import { useActionConfig } from "../config";

const SecurityGroupList: React.FC<
  IListProps<ISecurityGroup, IZone & { __typename: string }>
> = (props) => {
  const actionConfig = useActionConfig();

  return (
    <SecurityGroupPlainList
      actionConfig={actionConfig}
      gql={securityGroupListForSelect}
      {...props}
    />
  );
};

export default SecurityGroupList;
