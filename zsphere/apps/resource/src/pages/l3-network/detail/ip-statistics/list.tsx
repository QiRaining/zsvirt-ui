import { ipStatistics } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type {
  IpStatistics as IIpStatistics,
  L3Network,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import { useQueryConfig, useColumnConfig } from "./config";

const IpStatisticsList: React.FC<IListProps<IIpStatistics, L3Network>> = (
  props,
) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const columnConfig = useColumnConfig(props?.source);

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      actionConfig={{
        list: [],
        viewMap: {},
      }}
      gql={ipStatistics}
      toolbar={["refresh", "search", "export"]}
      type="IpStatistics"
      resource="ipStatistics"
      {...props}
      rowSelection={false}
    />
  );
};

export default IpStatisticsList;
