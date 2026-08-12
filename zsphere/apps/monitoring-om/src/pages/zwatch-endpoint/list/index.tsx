import type { IListProps } from "@zstack/zsphere-types";
import type { EndPoint as IEndPoint } from "@zstack/zsphere-types/graphql";
import React from "react";
import List from "zsv_shared/zwatch-endpoint/base-list";

import useActionConfig from "../config/useActionConfig";
import useEndPointTypeMap from "../hooks/use-end-point-type-map";

export interface IProps {
  resource?: string;
  actionConfig?: any;
  columnConfig?: any;
  queryConfig?: any;
}

const ZWatchEndpointList: React.FC<IListProps<IEndPoint> & IProps> = (
  props,
) => {
  const endpointMap = useEndPointTypeMap();
  const actionConfig = useActionConfig();

  return (
    <List actionConfig={actionConfig} endpointMap={endpointMap} {...props} />
  );
};

export default ZWatchEndpointList;
