import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { TableList, type ITableListProps } from "@zstack/zsphere-components";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import { mergeWith } from "lodash-es";
import React, { useMemo } from "react";

import { useDefaultResourceAttributeConfig } from "../../../components/resource-attribute";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const QUERY_HOST_LIST = gql`
  query hostList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $topNumber: Int
    $fields: [String!]
    $type: HostQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $primaryStorageUuid: String
  ) {
    hostList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      fields: $fields
      limit: $limit
      topNumber: $topNumber
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        name
        uuid
        architecture
        managementIp
        callBackIp
        hypervisorType
        description
        state
        status
        osDistribution
        osRelease
        osVersion
        createDate
        lastOpDate
        cpuNum
        availableCpuCapacity
        sshPort
        username
        totalCpuCapacity
        availableMemoryCapacity
        totalMemoryCapacity
        extraIps
        connectedTime
        hostNodeInfo {
          nodeType
        }
        qemuState
        ipmiAddress
        ipmiPort
        ipmiUsername
        ipmiPassword
        ipmiPowerStatus
        iscsiInitiatorName
        nqn
        physicalNicList {
          uuid
          interfaceName
          hostNetworkInterfaceServiceRef {
            interfaceUuid
            vlanId
            serviceType
          }
        }
        bondList {
          uuid
          bondingName
          hostNetworkBondingServiceRef {
            bondingUuid
            vlanId
            serviceType
          }
        }
        bondRelatedVSwitch {
          uuid
          allSlavesActive
          bondingName
          hostUuid
          slaves {
            uuid
            interfaceName
            state
            speed
          }
          mode
          xmitHashPolicy
          bondingType
        }
        hostUsage {
          cpuUsed
          memoryUsed
          storageUsed
        }
        cluster {
          name
          uuid
          clusterKVMCpuModel
          resourceConfigValue {
            vmVideoType
            haVmHaLevel
            vmVmHaAcrossClusters
            vmEmulateHyperV
            kvmAutoSetVmNicMultiqueue
          }
        }
        zone {
          name
          uuid
        }
        owner {
          name
          uuid
        }
        tag {
          ownerUuid
          uuid
          name
          color
        }
        hostSystemInfo {
          cpuModelName
          hostCpuModelName
          ept
          eptUuid
          systemSerialNumber
          systemProductName
          cpuGHz
          cpuProcessorNum
          cpuSocketCoreThread {
            sockets
            coresPerSocket
            threadsPerCore
          }
        }
        localStorageHostDiskCapacity(primaryStorageUuid: $primaryStorageUuid) {
          availableCapacity
          availablePhysicalCapacity
          totalCapacity
          totalPhysicalCapacity
        }
        globalConifg {
          memoryOverProvisioning
          overProvisioningTotalMemory
          overProvisioningAvailableMemory
          reservedMemory
          availableCpuMemoryCapacity
          availableCpu
          availableMemory
          managedCpuNum
          totalCpu
          totalMemory
        }
        hostZWatchInfo {
          cpuAllIdleUtilization
          memoryFreeInPercent
          cpuAllUsedUtilization
          memoryUsedInPercent
          memoryFreeBytes
        }
        relatedVmCount
        relatedVolumeCount
      }
      total
    }
  }
`;

export interface IHostPlainListProps extends Omit<
  ITableListProps<IHost>,
  "gql"
> {
  toolbar?: ITableListProps<IHost>["toolbar"];
  gql?: DocumentNode;
  summaryRefetch?: () => void;
  hidenTagSearch?: boolean;
  maxSelectedCount?: number;
}

const toolbarWithExport = new Set([
  "sub.virtualization.zone",
  "sub.virtualization.cluster",
]);

const HostPlainList: React.FC<IHostPlainListProps> = ({
  actionConfig,
  view,
  source,
  columnConfig,
  queryConfig,
  toolbar,
  hidenTagSearch,
  ...props
}) => {
  let _toolbar = toolbar;

  const subToolbarView: boolean = [
    "sub.virtualization.nvmelun",
    "sub.host-qemu",
  ].includes(view);

  if (view?.startsWith("sub") && !toolbarWithExport.has(view)) {
    _toolbar = (toolbar || [])?.filter((it: string) => it !== "export");
  }

  if (subToolbarView) {
    _toolbar = ["refresh", "search"];
  }

  const resourceAttributeConfig =
    useDefaultResourceAttributeConfig() as unknown as ITableListProps<IHost>["resourceAttributeConfig"];

  const currentZoneUuid = useMemo(() => {
    switch (source?.__typename) {
      case "Cluster":
        return source?.zone?.uuid;
      case "HostGroup":
        return source?.zoneUuid;
      default:
        return null;
    }
  }, [source]);

  const mergedDefaultQuery = useMemo(() => {
    return mergeWith(
      {},
      props.defaultQuery,
      {
        start: 0,
        limit: 10,
        conditions: currentZoneUuid
          ? [
              {
                key: "zoneUuid",
                value: currentZoneUuid,
              },
            ]
          : [],
      },
      (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      },
    );
  }, [props?.defaultQuery, currentZoneUuid]);

  const defaultQueryConfig = useQueryConfig({
    view,
    defaultQuery: props.defaultQuery,
    hidenTagSearch,
  });

  const defaultColumnConfig = useColumnConfig({
    view,
  });

  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IHost>["actionConfig"];

  return (
    <TableList<IHost>
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={props.gql || QUERY_HOST_LIST}
      source={source}
      view={view}
      allGqlKeysWhenExport
      toolbar={_toolbar}
      defaultQuery={mergedDefaultQuery}
      resourceAttributeConfig={resourceAttributeConfig}
      onFetchChange={() => {
        props.summaryRefetch?.();
      }}
      type="HostVO"
      resource="host"
      {...props}
    />
  );
};

export default HostPlainList;
