import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import React from "react";

import { queryResourceAttributeConstraint } from "../../../../gql/resource-attribute.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";
import Detail from "../detail";

import style from "./style.module.less";

export default function List(props: IListProps<ResourceAttributeConstraint>) {
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);

  return (
    <TableList
      gql={queryResourceAttributeConstraint}
      actionConfig={actionConfig}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      type="ResourceAttributeConstraint"
      resource="resource.attribute.constraint"
      rowKey="id"
      renderRowDetail={(record, visible, onClose, getContainer) => (
        <Detail
          current={record}
          visible={visible}
          onClose={onClose}
          getContainer={getContainer}
        />
      )}
      {...props}
      className={cls(style.tableList, props.className)}
    />
  );
}
