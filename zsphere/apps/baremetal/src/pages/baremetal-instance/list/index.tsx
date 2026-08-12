import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useDefaultResourceAttributeConfig } from "../../../components/resource-attribute";
import { baremetalInstanceList } from "../../../gql/baremetal-instance.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const toolbar: ITableListProps<IBaremetalInstance>["toolbar"] = [
  "refresh",
  "operation",
  "search",
  "setting",
  "export",
];

const BareMetalInstanceList: React.FC<IListProps<IBaremetalInstance>> = (
  props,
) => {
  const queryConfig = useQueryConfig({
    defaultQuery: props.defaultQuery,
    view: props.view,
  });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();
  const resourceAttributeConfig = useDefaultResourceAttributeConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={baremetalInstanceList}
      type="BaremetalInstance"
      resource="baremetal.instance"
      resourceAttributeConfig={resourceAttributeConfig}
      toolbar={toolbar}
      {...props}
    />
  );
};

export default BareMetalInstanceList;
