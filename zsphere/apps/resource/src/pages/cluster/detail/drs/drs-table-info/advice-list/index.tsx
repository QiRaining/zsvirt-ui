import { queryDRSAdviceList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { DRSAdvice } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useQueryConfig, useActionConfig, useColumnConfig } from "./config";

const List: React.FC<IListProps<DRSAdvice>> = ({
  helper: _helper,
  ...props
}) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={queryDRSAdviceList}
      toolbar={["refresh", "operation", "search"]}
      resource="seheduling-information"
      type="SehedulingInformation"
      {...props}
    />
  );
};

export default List;
