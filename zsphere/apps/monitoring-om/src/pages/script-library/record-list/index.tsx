import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ScriptExecuteRecord as IScriptExecuteRecord } from "@zstack/zsphere-types/graphql";
import React from "react";

import { scriptExecuteRecordList } from "../../../gql/script-library.gql";
import { useColumnConfig, useQueryConfig } from "./config";

const ScriptExecuteRecordList: React.FC<IListProps<IScriptExecuteRecord>> = ({
  helper,
  view,
  defaultQuery,
  ...props
}) => {
  const queryConfig = useQueryConfig({ view, defaultQuery });
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      defaultQuery={defaultQuery}
      gql={scriptExecuteRecordList}
      type="ScriptExecuteRecord"
      view={view}
      resource="scriptExecuteRecord"
      {...props}
    />
  );
};

export default React.memo(ScriptExecuteRecordList);
