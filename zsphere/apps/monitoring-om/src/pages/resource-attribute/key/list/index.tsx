import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React from "react";

import { queryResourceAttributeKey } from "../../../../gql/resource-attribute.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

export default function List(props: IListProps<ResourceAttributeKey>) {
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);
  return (
    <TableList
      gql={queryResourceAttributeKey}
      actionConfig={actionConfig}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      type="ResourceAttributeKey"
      resource="resource.attribute.key"
      {...props}
    />
  );
}
