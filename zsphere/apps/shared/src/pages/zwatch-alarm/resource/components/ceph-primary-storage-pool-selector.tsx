import { useLazyQuery, gql } from "@apollo/client";
import { Select } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import { formatStorage, genUuid } from "@zstack/zsphere-utils";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

const cephPrimaryStoragePoolList = gql`
  query cephPrimaryStoragePoolList(
    $start: Int
    $limit: Int
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $type: String
  ) {
    cephPrimaryStoragePoolList(
      start: $start
      limit: $limit
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
      type: $type
      replyWithCount: true
    ) {
      total
      list {
        uuid
        name
        poolName
        type
        totalCapacity
        usedCapacity
      }
    }
  }
`;

export interface IProps {
  defaultQuery?: IQuery;
  disabled?: boolean;
  value?: any;
  onChange?: (v: any) => void;
}

export default function CephPrimaryStoragePoolSelector({
  defaultQuery,
  disabled,
  ...props
}: IProps) {
  const intl = useIntl();

  const [query, { data }] = useLazyQuery(cephPrimaryStoragePoolList, {
    fetchPolicy: "no-cache",
    variables: defaultQuery,
  });

  useEffect(() => {
    if (!disabled) {
      query();
    }
  }, [disabled, query]);

  const options = React.useMemo(() => {
    const list = data?.cephPrimaryStoragePoolList.list ?? [];

    const typeMap: Record<string, string> = {
      Root: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.root",
        defaultMessage: "Root Disk Pool",
      }),
      Data: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.data",
        defaultMessage: "Data Disk Pool",
      }),

      ImageCache: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.imageCache",
        defaultMessage: "Image Cache Pool",
      }),

      BackupStorage: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.backupStorage",
        defaultMessage: "Image Storage Pool",
      }),
    };

    return list.map((item: any) => {
      const capacity = formatStorage(
        (item.totalCapacity ?? 0) - (item.usedCapacity ?? 0),
        2,
      );
      const type = typeMap[item.type] ?? "";
      const label = intl.formatMessage({
        id: "available",
        defaultMessage: "Available ",
      });
      return {
        key: item.uuid,
        label: item.poolName,
        value: item.uuid,
        extra: [`${type} | ${label} ${capacity}`],
      };
    });
  }, [data, intl]);

  return (
    <Select
      key={genUuid()}
      placeholder={intl.formatMessage({
        id: "select.cephPrimaryStoragePool",
        defaultMessage: "Select Ceph Pool",
      })}
      width="l"
      checkable
      mode="multiple"
      options={options}
      disabled={disabled}
      {...props}
    />
  );
}
