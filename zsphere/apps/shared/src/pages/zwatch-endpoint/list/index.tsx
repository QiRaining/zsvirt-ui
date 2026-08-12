import { TableList } from "@zstack/zsphere-components";
import { useActionConfig } from "@zstack/zsphere-engine/src/zwatch-endpoint";
import type { IListProps } from "@zstack/zsphere-types";
import type { EndPoint as IEndPoint } from "@zstack/zsphere-types/graphql";
import React from "react";

import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";
import { querySNSApplicationEndpointList } from "./zwatch-endpoint.gql";

export interface IProps {
  resource?: string;
  actionConfig?: any;
  endpointTypeMap?: any;
}

const ZWatchEndpointList: React.FC<IListProps<IEndPoint> & IProps> = (
  props,
) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig(props.endpointTypeMap);
  const actionConfig = useActionConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      actionConfig={actionConfig}
      gql={querySNSApplicationEndpointList}
      type="EndPoint"
      resource="zwatch.endpoint"
      {...props}
    />
  );
};

export default ZWatchEndpointList;
