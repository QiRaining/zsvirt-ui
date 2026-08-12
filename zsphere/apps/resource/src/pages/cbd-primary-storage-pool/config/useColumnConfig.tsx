import { InfoPopover, Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { ResourceUsageProgress } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zbs-primary-storage-pool";
import type { CBDPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

export default () => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  return useColumnConfig<CBDPrimaryStoragePool>([
    {
      key: "name",
      render: (current: CBDPrimaryStoragePool) => (
        <Text>{current?.logicalPoolName}</Text>
      ),
    },
    {
      key: "virtualCapacityAllocationRatio",
      title: (
        <div className="flex items-center gap-1">
          <span>
            {intl.formatMessage({
              id: "storage.capacityAllocationRatio",
              defaultMessage: "Storage Allocation Rate",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "zbs.primary.storage.pool.virtualCapacity.allocation.ratio.tooltip",
                  defaultMessage: `### Storage Allocation Rate

Displays the allocatable total and allocation of the storage pool.

1. Storage Allocation Rate = Allocated : Allocatable Total
2. Overcommittable Total = Physical Total - Reserved Physical Capacity
3. Allocatable Total = Overcommittable Total × Overcommitment Ratio
4. Remaining Allocatable = Allocatable Total - Allocated`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      ),
      render: (row) => {
        return (
          <ResourceUsageProgress
            poolType="cbd"
            resourceType="storage"
            metric="virtualCapacityAllocationRatio"
            total={row?.capacity || 0}
            available={row?.availableCapacity || 0}
            primaryStoragePoolCapacity={row?.cbdPrimaryStoragePoolCapacity}
            primaryStorageCapacity={row?.primaryStorageCapacity}
          />
        );
      },
    },
    {
      key: "capacity.usage",
      title: (
        <div className="flex items-center gap-1">
          <span>
            {intl.formatMessage({
              id: "primaryStorage.usage",
              defaultMessage: "Storage Utilization",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "zbs.primary.storage.pool.capacityUtilization.tooltip",
                  defaultMessage: `### Storage Utilization

Displays the storage usage of the storage pool.

1. Storage Utilization = Physical Used / Physical Capacity
2. Physical Available = Physical Capacity - Physical Used - Safety Threshold Capacity
3. Safety Threshold Capacity = Physical Capacity x (1 - Storage Utilization Threshold)`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      ),
      render: (row) => {
        return (
          <ResourceUsageProgress
            poolType="cbd"
            resourceType="storage"
            metric="capacityUtilization"
            total={row?.capacity || 0}
            available={row?.availableCapacity}
            primaryStoragePoolCapacity={row?.cbdPrimaryStoragePoolCapacity}
            primaryStorageCapacity={row?.primaryStorageCapacity}
          />
        );
      },
    },
    {
      key: "securityPolicy",
      formatter: (row: CBDPrimaryStoragePool) => {
        if (row.replicaNum) {
          return intl.formatMessage(
            {
              id: "n.replicas",
              defaultMessage: "{n} Replicas",
            },
            { n: row.replicaNum },
          );
        }
      },
    },
    {
      key: "createDate",
      formatter: (row) => {
        if (row.createTime) {
          return getServerTime(row.createTime * 1000).format(
            "YYYY-MM-DD HH:mm:ss",
          );
        }
      },
    },
  ]);
};
