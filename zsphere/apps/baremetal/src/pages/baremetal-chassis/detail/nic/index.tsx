import { TableList } from "@zstack/zsphere-components";
import {
  useQueryConfig,
  useColumnConfig,
} from "@zstack/zsphere-engine/src/baremetal-nic";
import type { IListProps } from "@zstack/zsphere-types";
import type { BaremetalChassisNicInfo as IBaremetalChassisNicInfo } from "@zstack/zsphere-types/graphql";
import React from "react";

import { baremetalChassisNicInfoList } from "../../../../gql/baremetal-chassis.gql";

const NicList: React.FC<IListProps<IBaremetalChassisNicInfo>> = (props) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig<IBaremetalChassisNicInfo>([
    {
      key: "name",
      render: (current: IBaremetalChassisNicInfo) => {
        return current?.devname;
      },
    },
    {
      key: "mac",
      render: (current: IBaremetalChassisNicInfo) => {
        return current?.mac;
      },
    },
    {
      key: "internet.speed",
      render: (current: IBaremetalChassisNicInfo) => {
        return current?.speed;
      },
    },
  ]);

  return (
    <TableList
      toolbar={["refresh"]}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={baremetalChassisNicInfoList}
      rowSelection={false}
      type="BaremetalNic"
      {...props}
    />
  );
};

export default NicList;
