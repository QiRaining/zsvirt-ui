import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SharedBlock as ISharedBlock } from "@zstack/zsphere-types/graphql";
import React from "react";

import { sharedBlockList } from "../../../gql/shared-block.gql";
import {
  useQueryConfig,
  useColumnConfig,
  useActionConfig,
} from "../config/index";
import Detail from "../detail";

const SharedBlockList: React.FC<IListProps<ISharedBlock>> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={sharedBlockList}
      resource="shared.block"
      type="SharedBlock"
      renderRowDetail={(record, visible, onClose, getContainer) => (
        <Detail
          current={record}
          visible={visible}
          onClose={onClose}
          getContainer={getContainer}
        />
      )}
      {...props}
    />
  );
};

export default SharedBlockList;
