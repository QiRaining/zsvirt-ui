import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";
import Detail from "../detail";

const QUERY_VM_SPEC_LIST = gql`
  query queryVmSpecList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmSpecList(
      conditions: $conditions
      start: $start
      limit: $limit
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        uuid
        name
        description
        platform
        hostname
        generateSID
        domainMode
        domainName
        domainUsername
        organization
        createDate
      }
      total
    }
  }
`;

export default function VmSpecList({
  defaultQuery,
  view,
  ...props
}: IListProps<VmCustomSpecification>) {
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({ view });
  const queryConfig = useQueryConfig(defaultQuery);

  return (
    <TableList
      view={view}
      gql={QUERY_VM_SPEC_LIST}
      type="VmCustomSpecification"
      resource="vm.spec"
      actionConfig={actionConfig}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      defaultQuery={defaultQuery}
      renderRowDetail={(record, open, onClose, getContainer) => (
        <Detail
          current={record}
          open={open}
          onClose={onClose}
          getContainer={getContainer}
        />
      )}
      {...props}
    />
  );
}
