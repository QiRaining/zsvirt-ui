import type { IListProps } from "@zstack/zsphere-types";
import type { SnmpTrapReceiver } from "@zstack/zsphere-types/graphql";
import React from "react";
import List from "zsv_shared/snmp-trap/base-list";

import useActionConfig from "../config/useActionConfig";

const SnmpTrapList: React.FC<IListProps<SnmpTrapReceiver>> = ({
  helper,
  ...props
}) => {
  const actionConfig = useActionConfig();

  return <List actionConfig={actionConfig} {...props} />;
};

export default SnmpTrapList;
