import type { IListProps } from "@zstack/zsphere-types";
import type { VmGroup } from "@zstack/zsphere-types/graphql";
import React, { useContext } from "react";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import { VmGroupPlainList } from "zsv_reliability_shared/vm-scheduling-rule/vm-group/mf-index";

import { useActionConfig } from "../config";

const VmGroupList: React.FC<IListProps<VmGroup>> = ({ ...props }) => {
  const { zoneUuid } = useContext(ZoneUuidContext);

  const actionConfig = useActionConfig();

  return (
    <VmGroupPlainList
      actionConfig={actionConfig}
      zoneUuid={zoneUuid}
      {...props}
    />
  );
};

export default VmGroupList;
