import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type {
  BasicEndPoint as IBasicEndPoint,
  EndPointSmsAddress as IEndPointSmsAddress,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import { queryEndpointSmsAddressList } from "../../../gql/zwatch-endpoint.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

interface IProps {
  currentEndpoint: IBasicEndPoint;
}

const ZWatchEndponitList: React.FC<
  IListProps<IEndPointSmsAddress> & IProps
> = ({
  currentEndpoint,
  defaultQuery = {},
  selectType = "checkbox",
  columnKeys = [],
  ...props
}) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig(currentEndpoint);
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={queryEndpointSmsAddressList}
      type="EndPointSmsAddress"
      defaultQuery={defaultQuery}
      selectType={selectType}
      columnKeys={columnKeys}
      {...props}
    />
  );
};

export default ZWatchEndponitList;
