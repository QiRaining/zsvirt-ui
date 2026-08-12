import { useQuery } from "@apollo/client";
import { InfoPopover, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { backupStorage } from "@zstack/virtualization-resource/src/gql/backup-storage.gql";
import { resourceConfigList } from "@zstack/virtualization-resource/src/gql/resource-config.gql";
import {
  DraggableCard,
  IResourceCapacityType,
  ResourceCapacityOld as ResourceCapacity,
} from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import { BackupStorageType, Op } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize, formatTime } from "@zstack/zsphere-utils";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { parseSize } from "../../create/advanced-config";

import style from "./style.module.less";

interface IProps {
  detail: IBackupStorage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const refreshIconContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const CapacityUsage: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const {
    type,
    availableCapacity = 0,
    totalCapacity = 0,
    poolAvailableCapacity = 0,
    poolUsedCapacity = 0,
    poolReplicatedSize = 0,
  } = detail;

  const [capacityData, setCapacityData] = useState({
    availableCapacity,
    totalCapacity,
    poolAvailableCapacity,
    poolUsedCapacity,
    poolReplicatedSize,
  });

  const [fetchTime, setFetchTime] = useState(Date.now());

  const { refetch } = useQuery(backupStorage, {
    variables: { uuid: detail?.uuid },
    notifyOnNetworkStatusChange: true,
    onCompleted: (res) => {
      const backupStorageInfo = res?.backupStorage;
      setCapacityData({
        availableCapacity:
          backupStorageInfo?.availableCapacity || availableCapacity,
        totalCapacity: backupStorageInfo?.totalCapacity || totalCapacity,
        poolAvailableCapacity:
          backupStorageInfo?.poolAvailableCapacity || poolAvailableCapacity,
        poolUsedCapacity:
          backupStorageInfo?.poolUsedCapacity || poolUsedCapacity,
        poolReplicatedSize:
          backupStorageInfo?.poolReplicatedSize || poolReplicatedSize,
      });
      setFetchTime(Date.now());
    },
  });

  const { data: reservedCapacityData, refetch: refetchReservedCapacity } =
    useQuery(resourceConfigList, {
      variables: {
        conditions: [
          {
            key: "categoryList",
            op: Op.in,
            values: ["backupStorage"],
          },
          {
            key: "nameList",
            op: Op.in,
            values: ["reservedCapacity"],
          },
          {
            key: "resourceUuid",
            value: detail?.uuid,
            op: Op.eq,
          },
        ],
      },
      notifyOnNetworkStatusChange: true,
      onCompleted: () => {
        setFetchTime(Date.now());
      },
    });

  const reservedCapacity =
    parseSize(reservedCapacityData?.resourceConfigList?.list?.[0]?.value) ?? 0;

  const handleRefresh = () => {
    refetch();
    refetchReservedCapacity();
    setFetchTime(Date.now());
  };

  return (
    <DraggableCard
      title={
        <div className="flex items-center gap-1">
          <span>
            {intl.formatMessage({
              id: "storage.info",
              defaultMessage: "Capacity Info",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backup.storage.info.tooltip",
                  defaultMessage: `### Capacity Info

Displays the storage capacity and usage in the image storage.

1. Storage Utilization = Used ÷ Total
2. Available = Total − Used − Reserved Capacity`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      }
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      extra={
        <div className="flex items-center gap-3">
          <span>
            {intl.formatMessage({
              id: "updateTime",
              defaultMessage: "Updated at",
            })}
            : {formatTime(fetchTime)}
          </span>
          <div style={refreshIconContainerStyle}>
            <Tooltip
              title={intl.formatMessage({
                id: "refresh",
                defaultMessage: "Refresh",
              })}
            >
              <Icon
                type="refresh"
                onClick={handleRefresh}
                className="action-icon"
              />
            </Tooltip>
          </div>
        </div>
      }
    >
      {(type as unknown as BackupStorageType) ===
        BackupStorageType.ImageStoreBackupStorage && (
        <div className="zsv-capacity-container">
          <ResourceCapacity
            type={IResourceCapacityType.Distribution}
            title={{
              label: (
                <div className="flex items-center gap-2.5">
                  <Illustration type="disk" size={24} />
                  <span>
                    {intl.formatMessage({
                      id: "storage",
                      defaultMessage: "Storage",
                    })}
                  </span>
                </div>
              ),
            }}
            name={{
              label: intl.formatMessage({
                id: "backupStorage.totalCapacity",
                defaultMessage: "Total",
              }),
              value: formatBytesToSize(capacityData?.totalCapacity),
            }}
            progress={[
              {
                percentage: reservedCapacity,
                color: "disabled",
                tooltip: [
                  {
                    label: intl.formatMessage({
                      id: "backupStorage.reservedCapacity",
                      defaultMessage: "Reserved Capacity",
                    }),
                    value: formatBytesToSize(reservedCapacity),
                  },
                ],
              },
              {
                percentage:
                  capacityData?.totalCapacity - capacityData?.availableCapacity,
                color: "info",
                tooltip: [
                  {
                    label: intl.formatMessage({
                      id: "backupStorage.usedCapacity",
                      defaultMessage: "Used",
                    }),
                    value: formatBytesToSize(
                      capacityData?.totalCapacity -
                        capacityData?.availableCapacity,
                    ),
                  },
                ],
              },
              {
                percentage: capacityData?.availableCapacity - reservedCapacity,
                tooltip: [
                  {
                    label: intl.formatMessage({
                      id: "backupStorage.availableCapacity",
                      defaultMessage: "Available",
                    }),
                    value: formatBytesToSize(
                      capacityData?.availableCapacity - reservedCapacity,
                    ),
                  },
                ],
              },
            ]}
            legend={[
              {
                label: intl.formatMessage({
                  id: "backupStorage.reservedCapacity",
                  defaultMessage: "Reserved Capacity",
                }),
                value: formatBytesToSize(reservedCapacity),
                color: "disabled",
              },
              {
                label: intl.formatMessage({
                  id: "backupStorage.usedCapacity",
                  defaultMessage: "Used",
                }),
                value: formatBytesToSize(
                  capacityData?.totalCapacity - capacityData?.availableCapacity,
                ),
                color: "info",
              },
              {
                label: intl.formatMessage({
                  id: "backupStorage.availableCapacity",
                  defaultMessage: "Available",
                }),
                value: formatBytesToSize(
                  capacityData?.availableCapacity - reservedCapacity,
                ),
              },
            ]}
          />
        </div>
      )}
      {/* ceph需要取池的容量: */}
      {(type as unknown as BackupStorageType) === BackupStorageType.Ceph && (
        <div className="zsv-capacity-container">
          <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
            <div style={{ flex: "0 1 50%" }}>
              <ResourceCapacity
                type={IResourceCapacityType.Distribution}
                title={
                  <div className="flex items-center gap-2.5">
                    <Illustration type="disk" size={24} />
                    <span>
                      {intl.formatMessage({
                        id: "storage",
                        defaultMessage: "Storage",
                      })}
                    </span>
                  </div>
                }
                name={{
                  label: intl.formatMessage({
                    id: "backupStorage.totalCapacity",
                    defaultMessage: "Total",
                  }),
                  value: formatBytesToSize(
                    poolUsedCapacity + poolAvailableCapacity,
                  ),
                }}
                progress={[
                  {
                    percentage: reservedCapacity,
                    color: "disabled",
                    tooltip: [
                      {
                        label: intl.formatMessage({
                          id: "backupStorage.reservedCapacity",
                          defaultMessage: "Reserved Capacity",
                        }),
                        value: formatBytesToSize(reservedCapacity),
                      },
                    ],
                  },
                  {
                    percentage: poolUsedCapacity,
                    color: "info",
                    tooltip: [
                      {
                        label: intl.formatMessage({
                          id: "backupStorage.usedCapacity",
                          defaultMessage: "Used",
                        }),
                        value: formatBytesToSize(poolUsedCapacity),
                      },
                    ],
                  },
                  {
                    percentage: poolAvailableCapacity - reservedCapacity,
                    tooltip: [
                      {
                        label: intl.formatMessage({
                          id: "backupStorage.availableCapacity",
                          defaultMessage: "Available",
                        }),
                        value: formatBytesToSize(
                          poolAvailableCapacity - reservedCapacity,
                        ),
                      },
                    ],
                  },
                ]}
                legend={[
                  {
                    label: intl.formatMessage({
                      id: "backupStorage.reservedCapacity",
                      defaultMessage: "Reserved Capacity",
                    }),
                    value: formatBytesToSize(reservedCapacity),
                    color: "disabled",
                  },
                  {
                    label: intl.formatMessage({
                      id: "backupStorage.usedCapacity",
                      defaultMessage: "Used",
                    }),
                    value: formatBytesToSize(poolUsedCapacity),
                    color: "info",
                  },
                  {
                    label: intl.formatMessage({
                      id: "backupStorage.availableCapacity",
                      defaultMessage: "Available",
                    }),
                    value: formatBytesToSize(
                      poolAvailableCapacity - reservedCapacity,
                    ),
                  },
                ]}
              />
            </div>
            <div
              className={` ${style["ceph-capacity"]}`}
              style={{ flex: "0 1 50%" }}
            >
              <ResourceCapacity
                type={IResourceCapacityType.Distribution}
                title={
                  <div className="flex items-center gap-2.5">
                    <Illustration type="pool-disk" size={24} />
                    <span>
                      {intl.formatMessage({
                        id: "backupStorage.pool",
                        defaultMessage: "Image Storage Pool",
                      })}
                    </span>
                  </div>
                }
                name={{
                  label: intl.formatMessage({
                    id: "backupStorage.totalCapacity",
                    defaultMessage: "Total",
                  }),
                  value: formatBytesToSize(
                    poolUsedCapacity + poolAvailableCapacity,
                  ),
                }}
                progress={[
                  {
                    percentage: poolUsedCapacity,
                    color: "info",
                    tooltip: [
                      {
                        label: intl.formatMessage({
                          id: "backupStorage.usedCapacity",
                          defaultMessage: "Used",
                        }),
                        value: formatBytesToSize(poolUsedCapacity),
                      },
                    ],
                  },
                  {
                    percentage: poolAvailableCapacity - reservedCapacity,
                    tooltip: [
                      {
                        label: intl.formatMessage({
                          id: "backupStorage.availableCapacity",
                          defaultMessage: "Available",
                        }),
                        value: formatBytesToSize(
                          poolAvailableCapacity - reservedCapacity,
                        ),
                      },
                    ],
                  },
                ]}
                legend={[
                  {
                    label: intl.formatMessage({
                      id: "backupStorage.usedCapacity",
                      defaultMessage: "Used",
                    }),
                    value: formatBytesToSize(poolUsedCapacity),
                    color: "info",
                  },
                  {
                    label: intl.formatMessage({
                      id: "backupStorage.availableCapacity",
                      defaultMessage: "Available",
                    }),
                    value: formatBytesToSize(
                      poolAvailableCapacity - reservedCapacity,
                    ),
                  },
                  {
                    label: intl.formatMessage({
                      id: "poolReplicatedCount",
                      defaultMessage: "Pool Replicas",
                    }),
                    value: intl.formatMessage(
                      {
                        id: "poolReplicatedCount.value",
                        defaultMessage: "{count}",
                      },
                      {
                        count: poolReplicatedSize,
                      },
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </DraggableCard>
  );
};

export default CapacityUsage;
