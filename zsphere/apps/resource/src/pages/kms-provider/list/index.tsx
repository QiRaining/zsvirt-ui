import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps, Item } from "@zstack/zsphere-types";

import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";
import Detail from "../detail";

const kmsProviderList = gql`
  query kmsProviderList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: String
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    kmsProviderList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        type
        isDefault
        connected
        endpoint
        port
        username
        trustState
        activeIdentityUuid
        activeIdentity {
          uuid
          certExpiredDate
        }
        serverCertExpiredDate
        serverCertPem
        backedUp
        createDate
      }
    }
  }
`;

export default function List(props: IListProps<Item>) {
  const queryConfig = useQueryConfig({ defaultQuery: props.defaultQuery });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={kmsProviderList}
      type="KmsProvider"
      resource="kms.provider"
      renderRowDetail={(record, visible, onClose, getContainer) => (
        <Detail
          detail={record}
          visible={visible}
          onClose={onClose}
          getContainer={getContainer}
        />
      )}
      {...(!props.view?.startsWith("select") && { rowSelection: false })}
      {...props}
    />
  );
}
