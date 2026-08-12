import { gql, useSuspenseQuery } from "@apollo/client";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import { useShallow } from "zustand/react/shallow";

import AlarmList from "./alarm";
import AuditList from "./audit";
import HardwareDevices from "./hardware-devices";
import Header from "./header";
import Monitoring from "./monitoring";
import Overview from "./overview";
import VMList from "./vm";
import Zskernel from "./zskernel";

const currentPlaceholder = {
  __typename: "HostVO",
  cluster: {
    __typename: "Cluster",
    name: "Cluster-1",
    state: "",
    clusterKVMCpuModel: "none",
    uuid: "",
    resourceConfigValue: {
      __typename: "ClusterResourceConfigValue",
      vmVideoType: "vga",
      haVmHaLevel: "None",
      vmVmHaAcrossClusters: "true",
      vmEmulateHyperV: "false",
      kvmAutoSetVmNicMultiqueue: "true",
    },
  },
  zone: { __typename: "Zone", name: "", uuid: "" },
  owner: { __typename: "AccountOwner", name: "", uuid: "" },
  tag: [],
  hostTopology: true,
  hostIommu: { __typename: "HostIommu", state: "Disabled", status: "Inactive" },
  hostSystemInfo: {
    __typename: "HostSystemInfo",
    cpuModelName: "",
    hostCpuModelName: "",
    ept: true,
    eptUuid: null,
    ipmiAddress: "None",
    systemSerialNumber: "",
    systemProductName: "",
    cpuGHz: "",
    cpuSocketCoreThread: {
      sockets: 1,
      coresPerSocket: 1,
      threadsPerCore: 1,
    }, //
  },
  localStorageHostDiskCapacity: {
    __typename: "LocalStorageHostDiskCapacity",
    availableCapacity: 0,
    availablePhysicalCapacity: 0,
    totalCapacity: 0,
    totalPhysicalCapacity: 0,
  },
  globalConifg: {
    __typename: "HostGlobalConfig",
    memoryOverProvisioning: 1,
    overProvisioningTotalMemory: 0,
    overProvisioningAvailableMemory: 0,
    reservedMemory: "1",
    availableCpuMemoryCapacity: 0,
    availableCpu: 0,
    availableMemory: 0,
    managedCpuNum: 0,
    totalCpu: 0,
    totalMemory: 0,
  },
  hostZWatchInfo: {
    __typename: "HostZWatchInfo",
    cpuAllIdleUtilization: "",
    memoryFreeInPercent: "",
    cpuAllUsedUtilization: "",
    memoryUsedInPercent: "",
    memoryFreeBytes: "",
  },
  relatedVmCount: 0,
  relatedVolumeCount: 0,
  hostGroup: null,
  name: "",
  uuid: "",
  architecture: "x86_64",
  managementIp: "",
  callBackIp: "",
  hypervisorType: "KVM",
  description: "",
  state: "Enabled",
  status: "Connected",
  osDistribution: "helix",
  osRelease: "Core",
  osVersion: "7.9",
  createDate: "",
  lastOpDate: "",
  cpuNum: 0,
  availableCpuCapacity: 0,
  sshPort: 22,
  username: "root",
  totalCpuCapacity: 0,
  availableMemoryCapacity: 0,
  totalMemoryCapacity: 0,
  extraIps: "",
  connectedTime: "",
  nodeType: "ComputeNode",
  qemuState: null,
  ipmiAddress: null,
  ipmiPort: 623,
  ipmiUsername: null,
  ipmiPassword: null,
  ipmiPowerStatus: "UN_CONFIGURED",
};

// TODO 查询看起来在本地有些问题  可能是某些字段查不出来 后续可以放开排查
const QUERY_HOST_DETAIL_LIST = gql`
  query host($uuid: String!) {
    host(uuid: $uuid) {
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
      cluster {
        name
        state
        clusterKVMCpuModel
        uuid
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
      # TODO 这个参数在dev模式下 查不出来 需要看看
      # hostTopology
      hostIommu {
        state
        status
      }
      hostSystemInfo {
        cpuModelName
        hostCpuModelName
        ept
        eptUuid
        ipmiAddress
        systemSerialNumber
        systemProductName
        cpuGHz
        cpuProcessorNum
        cpuSocketCoreThread {
          sockets
          coresPerSocket
          threadsPerCore
        } #
      }
      localStorageHostDiskCapacity {
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
      hostGroup {
        uuid
        name
      }
    }
  }
`;

const HostDetail: FC = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");

  const intl = useIntl();

  const { data, refetch: hostRefetch } = useSuspenseQuery<{ host: HostVO }>(
    QUERY_HOST_DETAIL_LIST,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        uuid,
      },
    },
  );

  const refetch = useCallback(() => {
    hostRefetch();
  }, [hostRefetch]);

  const [currentResource, cachedHosts, setCachedHosts] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedHosts,
        state.setCachedHosts,
      ]),
    );

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    if (data?.host && uuid) {
      const currentCachedHosts =
        useVirtualizationResourceStore.getState().cachedHosts;
      processCache(uuid, currentCachedHosts, setCachedHosts, data.host);
    }
  }, [data?.host, uuid]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    if (data?.host) {
      // 当有查询数据时，优先使用查询返回的 name
      return { ...currentPlaceholder, ...data.host };
    }
    // Get cached host without updating state
    const cachedInstanceIndex = cachedHosts.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedHost =
      cachedInstanceIndex > -1 ? cachedHosts[cachedInstanceIndex].data : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedHost,
      name: cachedHost?.name || currentResource?.name,
    };
  }, [data?.host, uuid, cachedHosts, currentResource?.name]);

  useActionSubscribe({
    resourceTypeList: ["StorageAdapter"],
    onFinish: () => {
      refetch();
    },
  });

  const tabsList: AuthTabsListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        value: "overview",
        content: () => <Overview current={current} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" }),
        value: "monitoring",
        content: () => <Monitoring uuid={uuid} />,
      },
      {
        label: intl.formatMessage({
          id: "hardware.devices",
          defaultMessage: "Hardware Device",
        }),
        value: "hardware.devices",
        noPadding: true,
        content: () => <HardwareDevices current={current} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({
          id: "zskernel",
          defaultMessage: "Kernel Adapter",
        }),
        value: "zskernel",
        content: () => <Zskernel current={current} />,
      },
      {
        label: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
        value: "vm",
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.vm",
        },
        content: () => <VMList current={current} />,
      },
      {
        label: intl.formatMessage({
          id: "alarm.tabName",
          defaultMessage: "Alarm",
        }),
        value: "zwatch.alarm",
        content: () => <AlarmList current={current} />,
      },
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "auditing",
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.auditing",
        },
        content: () => <AuditList uuid={uuid} />,
      },
    ],
    [intl, current, refetch, uuid],
  );

  return (
    <div className="zsv-detail-container">
      <Header current={current} refetch={refetch} />
      <AuthTabs
        variant="line"
        tabsList={tabsList}
        defaultValue="overview"
        contentId="main-tab"
        forceMount
        rootClassName="flex flex-col flex-1"
        listClassName="pl-6"
        contentClassName="px-6 py-5 flex-1 flex min-w-0 flex-col"
      />
    </div>
  );
};

export default React.memo(HostDetail);
