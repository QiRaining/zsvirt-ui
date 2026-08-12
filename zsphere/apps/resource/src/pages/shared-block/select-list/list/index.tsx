import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { CandidateSharedBlock as ICandidateSharedBlock } from "@zstack/zsphere-types/graphql";
import React from "react";

import { candidateSharedBlockList } from "../../../../gql/shared-block.gql";
import { useQueryConfig, useColumnConfig } from "../config/index";

const SharedBlockList: React.FC<IListProps<ICandidateSharedBlock>> = (
  props,
) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const columnConfig = useColumnConfig();

  return (
    <TableList
      rowKey="uuid"
      toolbar={[]}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={candidateSharedBlockList}
      resource="candidate.shared.block"
      type="CandidateSharedBlock"
      {...props}
    />
  );
};

export default SharedBlockList;
