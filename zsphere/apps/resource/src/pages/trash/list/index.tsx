import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Trash as ITrash } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { trashList } from "../../../gql/trash.gql";
import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

const List: React.FC<IListProps<ITrash>> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const intl = useIntl();
  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={trashList}
      resource="trash"
      type="Trash"
      toolbarHandleTooltip={
        props?.view === "sub.backup.storage" && (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backupStorage.tab.dataClean.action.clean.tooltip",
              defaultMessage: `### Cleanup
1. You can clean up raw data of images that is reatined after the backup storage migration.
2. Make sure that the storage migrated data is intact and then click Cleanup to clean up the raw data.
3. You cannot recover data that is cleaned up. Proceed with caution.`,
            })}
          </ReactMarkdown>
        )
      }
      toolbar={["refresh", "operation"]}
      {...props}
    />
  );
};

export default List;
