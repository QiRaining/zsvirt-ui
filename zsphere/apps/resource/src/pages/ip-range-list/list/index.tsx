import { ipRangeList as _ipRangeList } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type {
  IpRange as IIpRange,
  L3Network as IL3Network,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig, useColumnConfig } from "../config";

const IpRangeList: React.FC<
  IListProps<IIpRange> & {
    current: IL3Network;
    iL3NetworkType?: string;
    ipVersion?: 4 | 6;
  }
> = (props) => {
  const { current, ipVersion = 4 } = props;

  const actionConfig = useActionConfig({ current, ipVersion });
  const columnConfig = useColumnConfig(props.view);

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={[]}
      actionConfig={actionConfig}
      gql={_ipRangeList}
      type="IpRange"
      resource="ip.range"
      {...props}
    />
  );
};

export default IpRangeList;
