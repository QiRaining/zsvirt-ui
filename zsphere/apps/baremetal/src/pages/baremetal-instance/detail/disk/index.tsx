import { Text } from "@zstack/design";
import { TableList } from "@zstack/zsphere-components";
import {
  useQueryConfig,
  useColumnConfig,
} from "@zstack/zsphere-engine/src/baremetal-disk";
import type { IListProps } from "@zstack/zsphere-types";
import type { BaremetalDisk } from "@zstack/zsphere-types/graphql";
import React from "react";

import { baremetalDiskList } from "../../../../gql/baremetal-instance.gql";

const DiskList: React.FC<IListProps<BaremetalDisk>> = (props) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig<BaremetalDisk>([
    {
      key: "name",
      render: (current: BaremetalDisk) => {
        return <Text>{current.name}</Text>;
      },
    },
  ]);

  return (
    <TableList
      toolbar={["refresh"]}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={baremetalDiskList}
      type="BaremetalDisk"
      rowSelection={false}
      {...props}
    />
  );
};

export default DiskList;
