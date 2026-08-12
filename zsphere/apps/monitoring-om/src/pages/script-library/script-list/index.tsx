import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Script as IScript } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { scriptList } from "../../../gql/script-library.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "./config";

const ScriptList: React.FC<IListProps<IScript>> = ({
  helper,
  view,
  defaultQuery,
  ...props
}) => {
  const intl = useIntl();

  const queryConfig = useQueryConfig({ view, defaultQuery });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const helperMemo: ITableListProps<IScript>["helper"] = useMemo(
    () => ({
      authKey: "add.script",
      text: intl.formatMessage({
        id: "script.hepler",
        defaultMessage: "No available script.",
      }),
      linkText: intl.formatMessage({
        id: "goAdd",
        defaultMessage: "Add",
      }),
      microAppName: "virtualization-monitoring-om",
      to: "/virtualization-monitoring-om/script-library/script-list/create",
      ...helper,
    }),
    [intl, helper],
  );

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      defaultQuery={defaultQuery}
      gql={scriptList}
      helper={helperMemo}
      type="Script"
      view={view}
      resource="script"
      {...props}
    />
  );
};

export default React.memo(ScriptList);
