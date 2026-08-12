import { TableList } from "@zstack/zsphere-components";
import {
  useQueryConfig,
  useColumnConfig,
} from "@zstack/zsphere-engine/src/baremetal-disk";
import type { IListProps } from "@zstack/zsphere-types";
import type { BaremetalChassisDiskInfo } from "@zstack/zsphere-types/graphql";
import React from "react";

import { baremetalChassisDiskInfoList } from "../../../../gql/baremetal-chassis.gql";

const DiskList: React.FC<IListProps<BaremetalChassisDiskInfo>> = (props) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig<BaremetalChassisDiskInfo>([
    {
      key: "name",
      render: (current: BaremetalChassisDiskInfo) => {
        return current.name;
      },
    },
  ]);

  return (
    <TableList
      toolbar={["refresh"]}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={baremetalChassisDiskInfoList}
      type="BaremetalDisk"
      rowSelection={false}
      {...props}
    />
  );
};

export default DiskList;
