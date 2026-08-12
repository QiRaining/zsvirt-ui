import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { Link, State } from "@zstack/zsphere-components";
import type { IListView } from "@zstack/zsphere-types";
import type { DRSAdvice as IDRSAdvice } from "@zstack/zsphere-types/graphql";
import type { ColumnType } from "antd/es/table";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

type IKey = keyof IDRSAdvice;

interface IColumnType extends ColumnType<IDRSAdvice> {
  dataIndex?: IKey;
  key: IKey;
  width?: 200 | 120 | 80;
}

const viewMapToColumnKyes = new Map<IListView, IKey[]>([
  [
    "main",
    [
      "vmUuid",
      "vmSourceHostUuid",
      "vmTargetHostUuid",
      "reason",
      "status",
      "createDate",
    ],
  ],
  [
    "sub",
    [
      "vmUuid",
      "vmSourceHostUuid",
      "vmTargetHostUuid",
      "reason",
      "status",
      "createDate",
    ],
  ],
]);

const useColumns = (view: IListView, columnKeys?: IKey[]) => {
  const intl = useIntl();

  const { getServerTime } = useTime();

  const columns: IColumnType[] = useMemo(
    () => [
      {
        fixed: "left",
        width: 200,
        title: intl.formatMessage({
          id: "advice.migration.vm",
          defaultMessage: "VM To Be Migrated",
        }),
        dataIndex: "vmUuid",
        key: "vmUuid",
        render: (value, current) => {
          if (current?.vm?.uuid === undefined) {
            return <Text>{value}</Text>;
          }
          return (
            <Text>
              <Link
                to={`/vm/detail?uuid=${current?.vm?.uuid}`}
                microAppName="resource-pool"
              >
                {current?.vm?.name}
              </Link>
            </Text>
          );
        },
      },
      {
        width: 200,
        title: intl.formatMessage({
          id: "current.host",
          defaultMessage: "Current Host",
        }),
        dataIndex: "vmSourceHostUuid",
        key: "vmSourceHostUuid",
        render: (value, current) => {
          return (
            <>
              {current?.vmSourceHost?.name &&
              current?.vmSourceHost?.managementIp ? (
                <Text>
                  <Link
                    to={`/host/detail?uuid=${current?.vmSourceHost?.uuid}`}
                    microAppName="hardware"
                  >
                    {`${current?.vmSourceHost?.name} (${current?.vmSourceHost?.managementIp})`}
                  </Link>
                </Text>
              ) : (
                <span className={style.none}>
                  {intl.formatMessage({ id: "none", defaultMessage: "None" })}
                </span>
              )}
            </>
          );
        },
      },
      {
        width: 200,
        title: intl.formatMessage({
          id: "advice.target.host",
          defaultMessage: "Recommended Destination Host",
        }),
        dataIndex: "vmTargetHostUuid",
        key: "vmTargetHostUuid",
        render: (value, current) => {
          return (
            <>
              {current?.vmSourceHost?.name &&
              current?.vmSourceHost?.managementIp ? (
                <Text>
                  <Link
                    to={`/host/detail?uuid=${current?.vmTargetHost?.uuid}`}
                    microAppName="hardware"
                  >
                    {`${current?.vmTargetHost?.name} (${current?.vmTargetHost?.managementIp})`}
                  </Link>
                </Text>
              ) : (
                <span className={style.none}>
                  {intl.formatMessage({ id: "none", defaultMessage: "None" })}
                </span>
              )}
            </>
          );
        },
      },
      {
        width: 200,
        title: intl.formatMessage({ id: "reason", defaultMessage: "Reason" }),
        ellipsis: true,
        dataIndex: "reason",
        key: "reason",
        render: (value) => <Text title={value}>{value}</Text>,
      },
      {
        width: 200,
        title: intl.formatMessage({
          id: "executeStatus",
          defaultMessage: "Status",
        }),
        dataIndex: "status",
        key: "status",
        render: (value) => {
          switch (value) {
            case "Unexecuted":
              return (
                <>
                  <Icon type="alert-triangle-fill" color="danger" />{" "}
                  {intl.formatMessage({
                    id: "unexecuted",
                    defaultMessage: "To Be Executed",
                  })}
                </>
              );
            case "Implemented":
              return (
                <>
                  <State
                    type="success"
                    name={intl.formatMessage({
                      id: "executed",
                      defaultMessage: "Executed",
                    })}
                  />
                </>
              );
            case "InProgress":
              return (
                <>
                  <State
                    type="progress"
                    name={intl.formatMessage({
                      id: "executing",
                      defaultMessage: "Executing",
                    })}
                  />
                </>
              );
            default:
              return <></>;
          }
        },
      },
      {
        width: 200,
        title: intl.formatMessage({
          id: "adviceCreateTime",
          defaultMessage: "Recommended Creation Time",
        }),
        dataIndex: "createDate",
        key: "createDate",
        render: (value) => {
          return getServerTime(value).format("YYYY-MM-DD HH:mm:ss");
        },
      },
    ],
    [intl, getServerTime],
  );

  return useMemo(() => {
    const keys = columnKeys?.length
      ? columnKeys
      : viewMapToColumnKyes.get(view)!;

    return {
      columns,
      filterColumns: columns.filter((column) => keys.includes(column.key)),
    };
  }, [view, columns, columnKeys]);
};

export default useColumns;
