import { Text } from "@zstack/design";
import { ResourceName, TableList } from "@zstack/zsphere-components";
import {
  useQueryConfig,
  useColumnConfig,
} from "@zstack/zsphere-engine/src/baremetal-nic";
import type { IListProps } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { BaremetalNic as IBaremetalNic } from "@zstack/zsphere-types/graphql";
import React from "react";

import { baremetalNicList } from "../../../../gql/baremetal-instance.gql";

const NicList: React.FC<IListProps<IBaremetalNic>> = (props) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig<IBaremetalNic>([
    {
      key: "pxe",
      render: (current: IBaremetalNic) => {
        return `${current?.pxe}`;
      },
    },
    {
      key: "network",
      render: (current: IBaremetalNic) => {
        return (
          <ResourceName
            value={current?.l3Network?.name}
            link={{
              uuid: current.l3Network?.uuid,
              to: "/l3-network",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.Network,
            }}
          />
        );
      },
    },
    {
      key: "mac",
      render: (current: IBaremetalNic) => {
        return <Text>{current.mac}</Text>;
      },
    },
  ]);

  return (
    <TableList
      toolbar={["refresh"]}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={baremetalNicList}
      rowSelection={false}
      type="BaremetalNic"
      {...props}
    />
  );
};

export default NicList;
