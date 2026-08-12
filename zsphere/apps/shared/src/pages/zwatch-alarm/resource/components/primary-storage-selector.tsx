import { useLazyQuery, gql } from "@apollo/client";
import { Select } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import React from "react";
import { useIntl } from "react-intl";

const primaryStorageList = gql`
  query primaryStorageList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $type: PrimaryStorageQueryType
    $extraConditions: [Condition!]
  ) {
    primaryStorageList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      type: $type
      replyWithCount: true
    ) {
      total
      list {
        uuid
        name
      }
    }
  }
`;

export interface IProps {
  defaultQuery?: IQuery;
  onChange?: (val: string) => void;
}

export default function PrimaryStorageSelector({
  defaultQuery,
  ...props
}: IProps) {
  const intl = useIntl();

  const [query, { data }] = useLazyQuery(primaryStorageList, {
    fetchPolicy: "no-cache",
    variables: defaultQuery,
  });

  useMount(() => {
    query();
  });

  const options = React.useMemo(() => {
    const list = data?.primaryStorageList.list ?? [];

    return list.map((item: any) => ({
      key: item.uuid,
      label: item.name,
      value: item.uuid,
    }));
  }, [data]);

  return (
    <Select
      placeholder={intl.formatMessage({
        id: "select.primaryStorage",
        defaultMessage: "Select Data Storage",
      })}
      width="s"
      options={options}
      {...props}
    />
  );
}
