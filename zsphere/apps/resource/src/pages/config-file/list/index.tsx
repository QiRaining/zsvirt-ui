import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ConfigFile as IConfigFile } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useColumnConfig, useQueryConfig } from "../config";

const CONFIG_FILE_LIST = gql`
  query configFileList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $primaryStorageUuid: String
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    configFileList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
      primaryStorageUuid: $primaryStorageUuid
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        path
        architecture
        hostUuid
      }
    }
  }
`;

const List: React.FC<IListProps<IConfigFile>> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={CONFIG_FILE_LIST}
      resource="config.file"
      type="ConfigFile"
      toolbar={["refresh", "search"]}
      {...props}
    />
  );
};

export default List;
