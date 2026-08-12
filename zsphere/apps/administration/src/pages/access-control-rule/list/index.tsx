import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps, IQuery } from "@zstack/zsphere-types";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import { accessControlRuleList } from "../../../gql/access-control-rule.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";
import Detail from "../detail";

interface IProps extends IListProps<IAccessControlRule> {}

const toolbar: ITableListProps<IAccessControlRule>["toolbar"] = [
  "refresh",
  "operation",
  "search",
];

const List: React.FC<
  IProps &
    Partial<
      Pick<
        ITableListProps<IAccessControlRule>,
        "rowSelection" | "toolbar" | "rowKey"
      >
    >
> = ({ helper, defaultQuery, ...props }) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const defaultQueryMemo = useMemo<IQuery>(() => {
    const { conditions = [] } = defaultQuery ?? {};
    const baseConditions: IQuery["conditions"] = [];
    return { ...defaultQuery, conditions: [...conditions, ...baseConditions] };
  }, [defaultQuery]);

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={accessControlRuleList}
      type="AccessControlRule"
      resource="access.control.rule"
      toolbar={toolbar}
      defaultQuery={defaultQueryMemo}
      renderRowDetail={(record, visible, onClose, getContainer) => (
        <Detail
          detail={record}
          visible={visible}
          onClose={onClose}
          getContainer={getContainer as () => HTMLElement}
        />
      )}
      {...props}
    />
  );
};

export default List;
