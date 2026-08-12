import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ResourceAttributeValue } from "@zstack/zsphere-types/graphql";
import React from "react";

import { queryResourceAttributeValue } from "../../../../gql/resource-attribute.gql";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

export default function List(props: IListProps<ResourceAttributeValue>) {
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);

  return (
    <TableList
      gql={queryResourceAttributeValue}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      type="ResourceAttributeValue"
      resource="resource.attribute.value"
      rowSelection={false}
      {...props}
    />
  );
}
