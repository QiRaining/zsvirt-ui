import { useSuspenseQuery } from "@apollo/client";
import { cluster } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import {
  TabPane2 as TabPane,
  Tabs2 as Tabs,
  useSetTab,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import { useShallow } from "zustand/react/shallow";

import AuditList from "./audit";
import DRS from "./drs/index";
import Header from "./header";
import HostList from "./host";
import Monitoring from "./monitoring";
import Network from "./network";
import Overview from "./overview";
import ResourceConfig from "./resource-config";
import StorageList from "./storage";
import VmList from "./vm";

const currentPlaceholder = {
  __typename: "Cluster",
  isSupported: true,
  clusterZWatchInfo: {
    __typename: "ClusterZWatchInfo",
    cpuAllUsedUtilization: "0",
    memoryUsedInPercent: "0",
    memoryFreeBytes: "0",
  },
  l2NetworkCount: 0,
  l3NetworkCount: 0,
  vmInstanceList: [],
  name: "",
  uuid: "",
  description: null,
  createDate: "",
  lastOpDate: "",
  architecture: "x86_64",
  clusterKVMCpuModel: "none",
  checkCpuModel: "false",
  checkCpuModelId: "",
  displayNetworkCidr: "",
  migrateNetworkCidr: "",
  type: "zstack",
  state: "Enabled",
  vtepCidr: "",
  cpuMemoryCapacity: {
    __typename: "CpuMemoryCapacity",
    physicalCpu: null,
    availableCpu: null,
    totalCpu: null,
    availableMemory: null,
    totalMemory: null,
    reservedMemory: "",
    overProvisioningTotalMemory: 0,
    overProvisioningAvailableMemory: 0,
  },
  hypervisorType: "KVM",
  isShowDrsTab: false,
  isMaintenanceOfAllHost: true,
  isAttachL2network: false,
  isAttachPrimaryStorage: false,
  primaryStorageCount: 0,
  volumeCount: 0,
  hostNum: 0,
  hostList: [],
  vmInstanceCount: 0,

  zoneUuid: "",
  zone: { __typename: "Zone", name: "", uuid: "" },
  networkHp: false,
  resourceConfigValue: {
    __typename: "ClusterResourceConfigValue",
    hostCpuOverProvisioningRatio: "4",
    mevocoOverProvisioningMemory: "1",
    kvmIgnoreMsrs: "false",
    premiumClusterEnableZeroCopy: "false",
    kvmReservedMemory: "1G",
    premiumClusterHugepageEnable: "false",
    haVmHaLevel: "NeverStop",
    vmVmHaAcrossClusters: "true",
    vmEmulateHyperV: "false",
    vmVideoType: "vga",
    kvmAutoSetVmNicMultiqueue: "true",
    drsDrsMigrateVmConcurrent: "1",
    drsDrsSchedulingInterval: "600",
  },
};

interface IProps {
  location: Location;
}

const ClusterDetail: React.FC<IProps> = () => {
  const intl = useIntl();
  const { setTab } = useSetTab();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const lastResource = searchParams.get("lastResource") || "";
  const [routerTabTarget, serRouterTabTarget] = React.useState<
    undefined | string
  >();

  const { data, refetch: clusterRefetch } = useSuspenseQuery<{
    cluster: ICluster;
  }>(cluster, {
    fetchPolicy: "cache-and-network",
    variables: { uuid },
  });

  const refetch = () => {
    clusterRefetch();
  };

  const [currentResource, cachedClusters, setCachedClusters] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedClusters,
        state.setCachedClusters,
      ]),
    );

  useActionSubscribe({
    resourceTypeList: ["Cluster", "L2Network", "L3Network", "PrimaryStorageVO"],
    onProgress: () => {
      refetch?.();
    },
  });

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    if (data?.cluster && uuid) {
      const currentCachedClusters =
        useVirtualizationResourceStore.getState().cachedClusters;
      processCache(
        uuid,
        currentCachedClusters,
        setCachedClusters,
        data.cluster,
      );
    }
  }, [data?.cluster, uuid]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    if (data?.cluster) {
      // 当有查询数据时，优先使用查询返回的 name
      return { ...currentPlaceholder, ...data.cluster };
    }
    // Get cached cluster without updating state
    const cachedInstanceIndex = cachedClusters.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedCluster =
      cachedInstanceIndex > -1
        ? cachedClusters[cachedInstanceIndex].data
        : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedCluster,
      name: cachedCluster?.name || currentResource?.name,
    };
  }, [data?.cluster, uuid, cachedClusters, currentResource?.name]);

  useEffect(() => {
    if (lastResource === "/dynamic-resource-dispatch-strategy") {
      setTab("main-tab", "drs");
    }
    setTimeout(() => {
      serRouterTabTarget();
    }, 0);
  }, [lastResource, routerTabTarget]);

  return (
    <div className="zsv-detail-container">
      <Header current={current} refetch={refetch} />
      <Tabs
        key="cluster"
        type="line"
        destroyInactiveTabPane={true}
        contentId="main-tab"
        routerTarget={routerTabTarget}
      >
        <TabPane
          tab={intl.formatMessage({ id: "overview", defaultMessage: "Overview" })}
          key="overview"
        >
          <Overview
            current={current!}
            refetch={refetch}
            serRouterTabTarget={serRouterTabTarget}
          />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" })}
          key="monitoring"
        >
          <Monitoring uuid={uuid} />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({ id: "host", defaultMessage: "Host" })}
          key="host"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.host",
          }}
        >
          <HostList current={current!} refetch={refetch} />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
          key="vm"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.vm",
          }}
        >
          <VmList current={current!} refetch={refetch} />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({
            id: "dataStorage",
            defaultMessage: "Data Storage",
          })}
          key="storage"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.primary.storage",
          }}
        >
          <StorageList current={current!} refetch={refetch} />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({
            id: "manage.l2Network",
            defaultMessage: "Network Management",
          })}
          key="l2Network"
        >
          <Network current={current!} refetch={refetch} />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({
            id: "dynamicResourceDispatch",
            defaultMessage: "DRS",
          })}
          auth={{
            type: "view",
            resource: "virtualization.dynamic.resource.dispatch.strategy",
            authKey: "list",
          }}
          key="drs"
        >
          <DRS current={current} refetch={refetch} />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({
            id: "advancedSetting",
            defaultMessage: "Advanced Settings",
          })}
          key="setting"
          // auth={{
          //   type: 'block',
          //   resource: 'cluster',
          //   authKey: 'setting'
          // }}
          className="no-padding"
        >
          <ResourceConfig current={current} refetch={refetch} />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
          key="auditing"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.auditing",
          }}
        >
          <AuditList current={current} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(ClusterDetail);
