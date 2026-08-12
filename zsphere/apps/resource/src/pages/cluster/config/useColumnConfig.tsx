import { InfoPopover } from "@zstack/design";
import {
  ResourceName,
  ResourceUsageProgress,
} from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/cluster";
import type { IOption } from "@zstack/zsphere-engine/src/cluster/useColumnConfig";
import { mergeOptions } from "@zstack/zsphere-engine/utils";
import { ClusterState } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { sumBy as _sumBy } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

export enum VirCpuArchitectureEnum {
  aarch64 = "aarch64",
  x86_64 = "x86_64",
}

export default (args: any) => {
  const intl = useIntl();

  const isOpenOrClosed = React.useCallback(
    (value) => {
      return String(value) === "true"
        ? intl.formatMessage({
            id: "open",
            defaultMessage: "Enabled",
          })
        : intl.formatMessage({
            id: "closed",
            defaultMessage: "Disabled",
          });
    },
    [intl],
  );

  const options = React.useMemo<IOption<ICluster>>(
    () =>
      mergeOptions(
        [
          {
            key: "name",
            render: (current: ICluster) => (
              <ResourceName
                value={current?.name}
                link={{
                  to:
                    current?.hypervisorType === "baremetal"
                      ? "/baremetal-cluster"
                      : "/cluster",
                  microAppName: "virtualization-resource",
                  uuid: current?.uuid,
                  leftnav:
                    current?.hypervisorType === "baremetal"
                      ? LeftNavType.BareMetal
                      : LeftNavType.ClusterHost,
                  keepState: false,
                }}
              />
            ),
          },
          {
            key: "cpuUsedRate",
            minWidth: 120,
            render: (row) => {
              const {
                CPUAllUsedUtilization: usedNum = 0,
                totalCpuGHz: totalNum = 0,
              } = row?.realCpuMemoryCapacity ?? {};

              return (
                <ResourceUsageProgress
                  metric="cpuMemoryUtilization"
                  total={totalNum}
                  usedNum={usedNum}
                  available={totalNum > 0 ? 100 - usedNum : 0}
                  resourceType="cpu"
                />
              );
            },
          },
          {
            key: "memoryUsedRate",
            minWidth: 120,
            render: (row) => {
              const {
                MemoryUsedBytes: usedNum = 0,
                totalPhysicalMemory: totalNum = 0,
              } = row?.realCpuMemoryCapacity ?? {};

              return (
                <ResourceUsageProgress
                  total={totalNum}
                  usedNum={usedNum}
                  available={totalNum - usedNum}
                  metric="cpuMemoryUtilization"
                  resourceType="memory"
                />
              );
            },
          },
          {
            key: "primaryStorageUsedRate",
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
                        id: "primaryStorage.used.rate.tooltip",
                        defaultMessage: `### Storage Utilization

Displays the storage capacity and usage in the cluster.

1. Storage Utilization = Physical Used ÷ Physical Total
2. Physical Available = Physical Total − Physical Used − Safety Threshold Capacity
3. Safety Threshold Capacity = Physical Total × (1 − Storage Utilization Threshold)`,
                      })}
                    </ReactMarkdown>
                  }
                />
              </div>
            ),
            minWidth: 120,
            render: (row: ICluster) => {
              const usedNum =
                _sumBy(
                  row.primaryStorageList,
                  "primaryStorageCapacity.totalPhysicalCapacity",
                ) -
                _sumBy(
                  row.primaryStorageList,
                  "primaryStorageCapacity.availablePhysicalCapacity",
                );

              const available = _sumBy(
                row.primaryStorageList,
                "primaryStorageCapacity.availablePhysicalCapacity",
              );

              const reserved = _sumBy(
                row.primaryStorageList,
                "primaryStorageCapacity.reservedPhysicalCapacity",
              );

              const total = _sumBy(
                row.primaryStorageList,
                "primaryStorageCapacity.totalPhysicalCapacity",
              );

              return (
                <ResourceUsageProgress
                  total={total}
                  usedNum={usedNum}
                  available={available}
                  reserved={reserved}
                  metric="capacityUtilization"
                />
              );
            },
          },
          {
            key: "architecture",
            filterOptions: VirCpuArchitectureEnum,
          },

          {
            key: "hypervisorType",
            formatter: (current: ICluster) => {
              return current?.hypervisorType === "xdragon"
                ? "XDragon"
                : current?.hypervisorType;
            },
          },
          {
            key: "hostNum",
            formatter: (current: ICluster) => current?.hostNum || 0,
          },
          {
            key: "state",
            filterOptions: ClusterState,
          },
          {
            key: "networkHp",
            auth: {
              type: "block",
              authKey: "cluster",
              resource: "network.hp",
            },
            formatter: (current) =>
              current.networkHp
                ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
                : intl.formatMessage({ id: "closed", defaultMessage: "Disabled" }),
            filters: [
              {
                text: intl.formatMessage({
                  id: "open",
                  defaultMessage: "Enabled",
                }),
                value: "on",
              },
              {
                text: intl.formatMessage({
                  id: "closed",
                  defaultMessage: "Disabled",
                }),
                value: "off",
              },
            ],
          },
          {
            key: "drsState",
            render: (row: ICluster) => {
              return isOpenOrClosed(row.isShowDrsTab);
            },
          },
          {
            key: "haVmHaLevel",
            render: (row: ICluster) => {
              return isOpenOrClosed(
                row.resourceConfigValue?.haVmHaLevel === "NeverStop",
              );
            },
          },
          {
            key: "cross.cluster.ha",
            render: (row: ICluster) => {
              return isOpenOrClosed(
                row.resourceConfigValue?.vmVmHaAcrossClusters,
              );
            },
          },
        ],
        args?.options || [],
      ),
    [args.options, intl, isOpenOrClosed],
  );

  return useColumnConfig(options);
};
