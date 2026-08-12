import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { CandidateSharedBlock as ICandidateSharedBlock } from "@zstack/zsphere-types/graphql";
import React from "react";

import { candidateSharedBlockList } from "../../../gql/shared-block.gql";
import { useQueryConfig, useColumnConfig } from "../config";

const SharedBlockList: React.FC<IListProps<ICandidateSharedBlock>> = (
  props,
) => {
  const _queryConfig = useQueryConfig(props.defaultQuery);
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      // queryConfig={queryConfig}
      gql={candidateSharedBlockList}
      resource="shared.block"
      type="SharedBlock"
      {...props}
    />
  );
};

export default SharedBlockList;
