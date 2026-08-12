import { InfoPopover } from "@zstack/design";
import { Constant, ResourceUsageProgress } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/ceph-primary-storage-pool";
import { CephPrimaryStoragePoolType as ICephPrimaryStoragePoolType } from "@zstack/zsphere-types";
import type { CephPrimaryStoragePool as ICephPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import type { TableColumnType } from "antd";
import _ from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

export default () => {
  const intl = useIntl();

  const cephPrimaryStoragePoolTypeFilters = useMemo(() => {
    const filters: TableColumnType<ICephPrimaryStoragePool>["filters"] = [];

    const poolTypes = _.omit(ICephPrimaryStoragePoolType, [
      ICephPrimaryStoragePoolType.Data,
      ICephPrimaryStoragePoolType.Root,
      ICephPrimaryStoragePoolType.BackupStorage,
    ]);

    _.forEach(poolTypes, (key) => {
      filters.push({
        value: key,
        text: (
          <Constant
            enumType={ConstantType.CephPrimaryStoragePoolType}
            value={key as unknown as ConstantEnum}
          />
        ),
      });
    });

    filters.push({
      value: ICephPrimaryStoragePoolType.Data,
      text: (
        <Constant
          value={
            intl.formatMessage({
              id: "CephPrimaryStoragePool",
              defaultMessage: "Storage Pool",
            }) as ConstantEnum
          }
        />
      ),
    });

    return filters;
  }, [intl]);

  return useColumnConfig<ICephPrimaryStoragePool>([
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
                  id: "virtualCapacityAllocationRatio.tooltip",
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
      sortKey: "(totalCapacity - availableCapacity) / totalCapacity",
      render: (row) => {
        return (
          <ResourceUsageProgress
            poolType="ceph"
            resourceType="storage"
            metric="virtualCapacityAllocationRatio"
            total={row?.totalCapacity || 0}
            available={row?.availableCapacity || 0}
            primaryStoragePoolCapacity={row?.cephPrimaryStoragePoolCapacity}
            primaryStorageCapacity={row?.primaryStorageCapacity}
          />
        );
      },
    },
    {
      key: "capacityUtilization",
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
                  id: "capacityUtilization.tooltip",
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
      sortKey: "usedCapacity / totalCapacity",
      render: (row) => {
        return (
          <ResourceUsageProgress
            poolType="ceph"
            resourceType="storage"
            metric="capacityUtilization"
            total={row?.totalCapacity || 0}
            available={row?.totalCapacity - row?.usedCapacity || 0}
            primaryStoragePoolCapacity={row?.cephPrimaryStoragePoolCapacity}
            primaryStorageCapacity={row?.primaryStorageCapacity}
          />
        );
      },
    },
    {
      key: "type",
      filters: cephPrimaryStoragePoolTypeFilters,
      formatter: ({ type }) => {
        if (
          _.includes(
            [
              ICephPrimaryStoragePoolType.Data,
              ICephPrimaryStoragePoolType.Root,
            ],
            type,
          )
        ) {
          return (
            <Constant
              value={
                intl.formatMessage({
                  id: "CephPrimaryStoragePool",
                  defaultMessage: "Storage Pool",
                }) as ConstantEnum
              }
            />
          );
        }

        return (
          <Constant
            value={type as unknown as ConstantEnum}
            enumType={ConstantType.CephPrimaryStoragePoolType}
          />
        );
      },
    },
    {
      key: "securityPolicy",
      formatter: (current) => {
        const securityPolicy = _.get(current, "securityPolicy", "ErasureCode");
        const replicatedSize: number = Number(_.get(current, "replicatedSize"));
        const diskUtilization: number = Number(
          _.get(current, "diskUtilization"),
        );
        const _ErasureCode = securityPolicy === "ErasureCode" ? "EC" : null;
        const k = _.round(replicatedSize * diskUtilization);
        const m = _.round(replicatedSize * (1 - diskUtilization));
        if (_ErasureCode) {
          return intl.formatMessage(
            {
              id: "erasureCode.k.m",
              defaultMessage: "{erasureCode} {k} {m}",
            },
            { erasureCode: _ErasureCode, k, m },
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
