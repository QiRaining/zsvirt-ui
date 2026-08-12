import { TableList } from "@zstack/zsphere-components";
import { useQueryConfig } from "@zstack/zsphere-engine/src/baremetal-chassis";
import type { IListProps } from "@zstack/zsphere-types";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import React from "react";

import { baremetalChassisList } from "../../../gql/baremetal-chassis.gql";
import useAtionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";

const BareMetalChassisList: React.FC<IListProps<IBaremetalChassis>> = (
  props,
) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useAtionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={baremetalChassisList}
      type="BaremetalChassis"
      resource="baremetal.chassis"
      {...props}
    />
  );
};

export default BareMetalChassisList;
