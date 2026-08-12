import { InfoPopover } from "@zstack/design";
import { ResourceUsageProgress } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/vhost-primary-storage-pool";
import type { ExternalPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import { get, round } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

export default () => {
  const intl = useIntl();

  return useColumnConfig<ExternalPrimaryStoragePool>([
    {
      key: "virtualCapacityAllocationRatio",
      title: (
        <div className="inline-flex items-center gap-1">
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
                  id: "vhost.primary.storage.pool.virtualCapacityAllocationRatio.tooltip",
                  defaultMessage: `### Storage Allocation Rate

Displays the total allocatable capacity and allocation status of the data storage.

1. Storage Allocation Rate = Allocated ÷ Total Allocatable
2. Total Overcommit Capacity = Physical Total - Reserved Physical Capacity
3. Total Allocatable = Total Overcommit Capacity × Overcommit Ratio
4. Free to Allocate = Total Allocatable - Allocated`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      ),
      render: (row) => {
        return (
          <ResourceUsageProgress
            poolType="vhost"
            resourceType="storage"
            metric="virtualCapacityAllocationRatio"
            total={row?.totalCapacity || 0}
            available={row?.availableCapacity || 0}
            primaryStoragePoolCapacity={row?.externalPrimaryStoragePoolCapacity}
            primaryStorageCapacity={row?.primaryStorageCapacity}
          />
        );
      },
    },
    {
      key: "capacity.usage",
      title: (
        <div className="inline-flex items-center gap-1">
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
                  id: "vhost.primary.storage.pool.capacityUtilization.tooltip",
                  defaultMessage: `### Storage Utilization

Displays the storage capacity and usage in the storage pool.

1. Storage Utilization = Physical Used ÷ Physical Total
2. Physical Available = Physical Total − Physical Used − Safety Threshold Capacity
3. Safety Threshold Capacity = Physical Total × (1 − Storage Utilization Threshold)`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      ),
      render: (row) => {
        return (
          <ResourceUsageProgress
            poolType="vhost"
            resourceType="storage"
            metric="capacityUtilization"
            total={row?.totalCapacity || 0}
            available={row?.totalCapacity - row?.usedCapacity || 0}
            primaryStoragePoolCapacity={row?.externalPrimaryStoragePoolCapacity}
            primaryStorageCapacity={row?.primaryStorageCapacity}
          />
        );
      },
    },
    {
      key: "securityPolicy",
      formatter: (current) => {
        const redundancyPolicy = get(current, "redundancyPolicy", "erasure");
        const replicatedSize = Number(get(current, "replicatedSize"));
        const diskUtilization = Number(get(current, "diskUtilization"));

        const _ErasureCode = redundancyPolicy === "erasure" ? "EC" : null;
        const _k = round(replicatedSize * diskUtilization);
        const _m = round(replicatedSize * (1 - diskUtilization));

        if (_ErasureCode) {
          return intl.formatMessage(
            {
              id: "erasureCode.k.m",
              defaultMessage: "{erasureCode} {k} {m}",
            },
            { erasureCode: _ErasureCode },
          );
        }

        return intl.formatMessage(
          {
            id: "n.replicas",
            defaultMessage: "{n} Replicas",
          },
          { n: replicatedSize },
        );
      },
    },
  ]);
};
