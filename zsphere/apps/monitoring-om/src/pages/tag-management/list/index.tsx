import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  useActionConfig as _useActionConfig,
  useColumnConfig as _useColumnConfig,
  useQueryConfig as _useQueryConfig,
} from "../config";

const queryTagList = gql`
  query queryTagList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: TagQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $resourceType: String
    $resourceConditions: [Condition!]
  ) {
    tagList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      replyWithCount: true
      sortBy: $sortBy
      sortDirection: $sortDirection
      resourceType: $resourceType
      resourceConditions: $resourceConditions
    ) {
      total
      list {
        uuid
        name
        color
        type
        createDate
        value
        lastOpDate
        description
        owner {
          uuid
          type
          name
        }
        resourceCount
      }
    }
  }
`;

const TagList: React.FC<IListProps<ITag> & Partial<ITableListProps<ITag>>> = ({
  useQueryConfig = _useQueryConfig,
  useColumnConfig = _useColumnConfig,
  useActionConfig = _useActionConfig,
  ...props
}) => {
  const intl = useIntl();
  const queryConfig = useQueryConfig({ defaultQuery: props.defaultQuery });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({
    view: props.view === "sub.create" ? "select" : "main",
  });

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      toolbarHandleTooltip={{
        title: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "tag.tab.tooltip",
              defaultMessage:
                "### Tag \n\nCreate tags for resources as needed and search for resources by tag type and tag name.\n\n1. Two types of tags are available: admin tag and user tag.\n\n    - Admin tag: created and owned by the administrator.\n    - User tag: created and owned by the users \n\n2. Users can add their own tags to the allocated resources.\n3. The administrator can remove or delete user tags.",
            })}
          </ReactMarkdown>
        ),
      }}
      gql={queryTagList}
      type="Tag"
      resource="tag"
      {...props}
    />
  );
};

export default React.memo(TagList);
