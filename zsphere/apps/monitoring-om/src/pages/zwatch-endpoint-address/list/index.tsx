import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type {
  BasicEndPoint as IBasicEndPoint,
  EndPointEmailAddress as IEndPointEmailAddress,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import { queryEndpointEmailAddressList } from "../../../gql/zwatch-endpoint.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

interface IProps {
  currentEndpoint: IBasicEndPoint;
}

const ZWatchEndponitList: React.FC<
  IListProps<IEndPointEmailAddress> & IProps
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
      gql={queryEndpointEmailAddressList}
      type="EndPointEmailAddress"
      resource="endpoint-email-address"
      defaultQuery={defaultQuery}
      selectType={selectType}
      columnKeys={columnKeys}
      {...props}
    />
  );
};

export default ZWatchEndponitList;
