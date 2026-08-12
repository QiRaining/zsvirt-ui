import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";
import type { IListProps } from "@zstack/zsphere-types";
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";
import PreconfigurationTemplateListDetail from "../detail";

type IProps = IListProps<IPreconfigurationTemplate> &
  Pick<ITableListProps<IPreconfigurationTemplate>, "expandable"> & {
    actionRefetch?: () => any;
    showExpandable?: boolean;
    queryProps?: IQueryProps;
    getDetailContainer?: any;
  };

const QUERY_PRECONFIGURATION_TEMPLATE_LIST = gql`
  query preconfigurationTemplateList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    preconfigurationTemplateList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
        type
        isPredefined
        customParams
        owner {
          name
          uuid
        }
        state
        description
        content
        distribution
        createDate
        lastOpDate
        md5sum
      }
      total
    }
  }
`;

const PreconfigurationTemplateList: React.FC<IProps> = (props) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={QUERY_PRECONFIGURATION_TEMPLATE_LIST}
      type="PreconfigurationTemplate"
      resource="pre.config.template"
      renderRowDetail={(record, visible, onClose, getContainer) => (
        <PreconfigurationTemplateListDetail
          {...props}
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

export default PreconfigurationTemplateList;
