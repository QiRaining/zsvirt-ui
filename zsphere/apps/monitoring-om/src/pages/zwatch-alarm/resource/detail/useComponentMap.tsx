import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import type { AlarmLabels as IAlarmLabels } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import BackupStorageList from "zsv_resource/backup-storage/list";
import BareMetalInstanceList from "zsv_resource/baremetal-instance/list";
import CephPrimaryStoragePoolList from "zsv_resource/ceph-primary-storage-pool/list";
import HostList from "zsv_resource/host/list";
import L3NetworkList from "zsv_resource/l3-network/list";
import PrimaryStorageList from "zsv_resource/primary-storage/list";
import VmList from "zsv_resource/vm/list";

import style from "./style.module.less";

const vmInstanceList = gql`
  query vmInstanceList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        vmUsage {
          cpuUsed
          memoryUsed
          storageUsed
        }
        cpuModeInfo {
          value
          dependentResourceType
        }
        snapshotSchedulerJob {
          uuid
        }
        uuid
        name
        healthStatus
        architecture
        crashStrategy
        type
        metric {
          time
          value
        }
        vnuma
        hypervisorType
        cpuNum
        memorySize
        createDate
        lastOpDate
        description
        state
        clusterUuid
        rootVolumeUuid
        attachedShareableVolumeUuidList
        platform
        guestOsType
        defaultL3NetworkUuid
        imageUuid
        lastHostUuid
        hostUuid
        backupStatus
        backupTaskStatus
        reservedMemorySize
        defaultL3Network {
          name
          uuid
          ipVersion
          networkType
        }
        backupTaskType
        owner {
          uuid
          name
          type
          linkedAccountUuid
        }
        cluster {
          name
          state
          uuid
        }
        host {
          uuid
          name
          state
          status
          managementIp
          cpuNum
          clusterUuid
        }
        lastHost {
          uuid
          name
          state
          managementIp
          clusterUuid
        }
        sshKeyPairNum
        image {
          name
          uuid
          status
        }
        primaryStorage {
          name
          uuid
          type
          state
          availableCapacity
          defaultProtocol
        }
        tag {
          ownerUuid
          name
          uuid
          color
        }
        vmNics {
          type
          uuid
          mac
          ip
          deviceId
          usedIps {
            uuid
            ip
            ipVersion
            l3NetworkUuid
          }
          l3NetworkUuid
          l3Network {
            ... on L3Network {
              name
              uuid
              l2NetworkUuid
              l2Network {
                uuid
                vSwitchType
              }
              networkServices {
                networkServiceType
              }
            }
          }
        }
        eip {
          uuid
          name
          vipIp
        }
        allVolumes {
          uuid
          name
          primaryStorageUuid
          size
          actualSize
          isShareable
          type
          installPath
          primaryStorage {
            type
            uuid
          }
        }
        gpuDeviceSpec {
          name
          isVirtual
          type
          uuid
          deviceType
        }
        systemTag {
          cpuCores
          cpuSockets
          haStickStragedy
          sshkey
          bootOrder
          bootOrderOnce
          consolePassword
          vmConsoleMode
          vmPriority
          GuestTools
          bootMode
          RDPEnable
          usbRedirect
          qemuga
          antiSpoofing
          VDIMonitorNumber
          userdata
          clockTrack
          timeTrack
          isoList {
            uuid
            index
          }
          vmCpuPinningList {
            vCPU
            pCPU
          }
          staticIp {
            l3NetworkUuid
            ip
          }
          vmDriver
          hostname
          qxlMemory {
            ram
            vram
            vgamem
          }
          vmMachineType
        }
        vmHa {
          haLevel
        }
        vmCdRoms {
          uuid
          isoUuid
        }
        zoneUuid
        zone {
          uuid
          name
        }
        relatedResource {
          backupData
        }
        exportInfo {
          uuid
          name
          exportUrl
          createDate
          size
        }
        vmGroup {
          uuid
          name
          vmSchedulingRuleCount
          associatedVmSchedulingRuleList {
            uuid
            name
            rule
            mode
            hostGroup {
              uuid
              name
            }
          }
          vmCount
        }
        schedulingState
        group {
          groupName
          uuid
        }
        qemuState
        haveScsiLun
        lastBackupJobResult {
          id
          fireInstanceId
          success
          resultDump
        }
        localBackupCount
        localBackupCapacity
        backupJob {
          uuid
          jobData
          state
          schedulerJobGroupJobRefs {
            schedulerJobGroupUuid
            priority
          }
          schedulerJobGroup {
            uuid
            name
          }
        }
        shareType
        userGroup {
          uuid
          name
        }
        lastOpDate
      }
    }
  }
`;

const backupStorageList = gql`
  query backupStorageList(
    $conditions: [Condition!]
    $limit: Int
    $start: Int
    $extraConditions: [Condition!]
    $type: BackupStorageQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    backupStorageList(
      conditions: $conditions
      limit: $limit
      start: $start
      replyWithCount: true
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        state
        status
        availableCapacity
        totalCapacity
        createDate
        lastOpDate
        systemTag
        name
        description
        type
        hostname
        url
        sshPort
        username
        poolName
        dataNetwork
        syncImageNetwork
        reservedCapacity
        poolAvailableCapacity
        poolUsedCapacity
        poolReplicatedSize
        zone {
          name
          uuid
        }
        mons {
          hostname
          monPort
          createDate
          lastOpDate
          backupStorageUuid
          monAddr
          sshPort
          status
          sshUsername
          sshPassword
          monUuid
        }
      }
    }
  }
`;

const hostList = gql`
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
        hostIommu {
          state
          status
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

const queryL3NetworkList = gql`
  query queryL3NetworkList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: L3NetworkQueryType
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    l3NetworkList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        category
        createDate
        description
        enableIPAM
        dhcpIp {
          ipv4
          ipv6
        }
        dns
        enableSRIOV
        ipVersion
        hypervisorType
        ipCapacity {
          totalCapacity
          availableCapacity
          ipv4AvailableCapacity
          ipv6AvailableCapacity
          ipv4TotalCapacity
          ipv6TotalCapacity
          ipv4UsedIpAddressNumber
        }
        ipRanges {
          addressMode
          createDate
          endIp
          gateway
          shareType
          ipCapacity {
            totalCapacity
            availableCapacity
            ipv4AvailableCapacity
            ipv6AvailableCapacity
            ipv4TotalCapacity
            ipv6TotalCapacity
            ipv4UsedIpAddressNumber
          }
          ipRangeType
          ipVersion
          l3NetworkUuid
          name
          netmask
          networkCidr
          prefixLen
          startIp
          uuid
          linkResource {
            vm
            vrouter
          }
        }
        lastOpDate
        l2NetworkUuid
        ipAllocateStrategy
        l2Network {
          name
          uuid
          type
          physicalInterface
          virtualNetworkId
          vSwitchType
          enableSRIOV
          attachedClusterUuids
        }
        vSwitchUuid
        vSwitch {
          name
          uuid
          type
          physicalInterface
          virtualNetworkId
          vSwitchType
          enableSRIOV
          attachedClusterUuids
        }
        networkTypeName
        networkType
        networkServices {
          networkServiceType
        }
        name
        mtu
        owner {
          name
          uuid
          type
          linkedAccountUuid
        }
        type
        uuid
        shareType
        isDefault
        hasDefaultKernel
        portGroup {
          uuid
          vlanId
        }
      }
      total
    }
  }
`;

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
        aliasName
        description
        createDate
        lastOpDate
        availableCapacity
        diskUtilization
        securityPolicy
        poolName
        primaryStorageUuid
        primaryStorage {
          uuid
          name
        }
        replicatedSize
        totalCapacity
        cephPrimaryStoragePoolCapacity {
          volumeSnapshotSize
          imageCacheSize
          volumeSize
          volumeActualSize
          vmTemplateVolumeCacheSize
          reservedCapacity
        }
        primaryStorageCapacity {
          reservedCapacity
          overProvisioningPrimaryStorage
          thresholdPrimaryStoragePhysicalCapacity
          totalPhysicalCapacity
          availablePhysicalCapacity
        }
        type
        usedCapacity
      }
    }
  }
`;

const primaryStorageList = gql`
  query primaryStorageList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $type: PrimaryStorageQueryType
    $extraConditions: [Condition!]
  ) {
    primaryStorageList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      type: $type
      replyWithCount: true
    ) {
      total
      list {
        uuid
        name
        description
        createDate
        lastOpDate
        attachedClusterUuids
        reservedCapacity
        reservedPhysicalCapacity
        availableCapacity
        availablePhysicalCapacity
        fsid
        defaultProtocol
        mons {
          hostname
        }
        mountPath
        pools {
          uuid
          type
          aliasName
          poolName
          availableCapacity
        }
        sharedBlockGroupType
        sharedBlocks {
          uuid
          name
        }
        state
        status
        systemUsedCapacity
        totalCapacity
        totalPhysicalCapacity
        type
        url
        volumeCount
        vmInstanceCount
        cbdMdsCount
        systemTag {
          nocephx
          thinProvision
          thinProvisionUuid
          gatewayCidr
          rootVolumePoolName
          dataVolumePoolName
          imageCachePoolName
          nfsMountOptions
          cephToken
          cephVendor
          coldMigrateNetwork
        }
        expired {
          isExpired
          dayDifference
        }
        zone {
          uuid
          name
        }
        clusters {
          uuid
          name
        }
        primaryStorageCapacity {
          totalPhysicalCapacity
          availablePhysicalCapacity
          overProvisioningPrimaryStorage
          thresholdPrimaryStoragePhysicalCapacity
          systemUsedCapacity
          reservedCapacity
          volumeSnapshotSize
          imageCacheSize
          volumeSize
          vmTemplateVolumeCacheSize
        }
        storageCapacityForLocalStorage {
          reservedPhysicalCapacity
          totalPhysicalCapacity
          availablePhysicalCapacity
          availableCapacity
        }
        zoneUuid
      }
    }
  }
`;

const baremetalInstanceList = gql`
  query baremetalInstanceList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    baremetalInstanceList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      replyWithCount: true
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        description
        uuid
        state
        status
        platform
        chassisUuid
        cluster {
          uuid
          name
        }
        managementIp
        port
        hardwareInfo {
          cpuNum
          cpuModel
          memory
        }
        tag {
          ownerUuid
          name
          uuid
          color
        }
        owner {
          uuid
          name
        }
        image {
          uuid
          name
        }
        baremetalPxeServer {
          uuid
          attachedClusterUuids
        }
        baremetalChassis {
          name
          uuid
        }
        zone {
          uuid
          name
        }
        createDate
      }
      total
    }
  }
`;

export interface ComponentMap {
  [prop: string]: {
    getComponent: (current: any, uuids?: string[]) => React.ReactElement;
    getList: () => React.FC<any>;
    getQuery?: (current: any) => DocumentNode;
  };
}

const useComponentMap = () => {
  const intl = useIntl();

  const componentMap: ComponentMap = {
    "ZStack/VM": {
      getQuery: () => vmInstanceList,
      getList: () => VmList,
      getComponent: (current, uuids: string[] = []) => {
        return (
          <>
            <h2 className={style.h2}>
              {intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
            </h2>
            <VmList
              view="sub.alarm"
              source={current}
              defaultQuery={{
                conditions: [
                  { key: "uuid", op: Op.in, values: uuids },
                  { key: "__excludeGatewayVm__", op: Op.eq, value: "true" },
                ],
              }}
            />
          </>
        );
      },
    },
    "ZStack/BackupStorage": {
      getQuery: () => backupStorageList,
      getList: () => BackupStorageList,
      getComponent: (current, uuids: string[] = []) => {
        return (
          <>
            <h2 className={style.h2}>
              {intl.formatMessage({
                id: "backupStorage",
                defaultMessage: "Image Storage",
              })}
            </h2>
            <BackupStorageList
              view="sub.alarm"
              source={current}
              defaultQuery={{
                conditions: [{ key: "uuid", op: Op.in, values: uuids }],
              }}
            />
          </>
        );
      },
    },
    "ZStack/Host": {
      getQuery: () => hostList,
      getList: () => HostList,
      getComponent: (current, uuids: string[] = []) => {
        return (
          <>
            <h2 className={style.h2}>
              {intl.formatMessage({ id: "host", defaultMessage: "Host" })}
            </h2>
            <HostList
              view="sub.alarm"
              source={current}
              defaultQuery={{
                conditions: [{ key: "uuid", op: Op.in, values: uuids }],
              }}
            />
          </>
        );
      },
    },
    "ZStack/L3Network": {
      getQuery: () => queryL3NetworkList,
      getList: () => L3NetworkList,
      getComponent: (current, uuids: string[] = []) => {
        return (
          <>
            <h2 className={style.h2}>
              {intl.formatMessage({
                id: "l3Network",
                defaultMessage: "Distributed Port Group",
              })}
            </h2>
            <L3NetworkList
              view="sub.virtualization.l2-network"
              source={current}
              defaultQuery={{
                conditions: [{ key: "uuid", op: Op.in, values: uuids }],
              }}
            />
          </>
        );
      },
    },
    "ZStack/PrimaryStorage": {
      getQuery: (current) =>
        [
          "PoolAvailableCapacityInPercent",
          "PoolUsedCapacityInPercent",
          "PoolVirtualAvailableCapacityInPercent",
        ].includes(current.metricName)
          ? cephPrimaryStoragePoolList
          : primaryStorageList,
      getList: () => PrimaryStorageList,
      getComponent: (current, uuids: string[] = []) => {
        if (
          [
            "PoolAvailableCapacityInPercent",
            "PoolUsedCapacityInPercent",
            "PoolVirtualAvailableCapacityInPercent",
          ].includes(current.metricName)
        ) {
          const labels = (current.labels ?? []).filter(
            (it: IAlarmLabels) => it.key === "PoolUuid",
          );

          const _uuids = labels?.[0]?.value?.split("|") ?? [];

          return (
            <>
              <h2 className={style.h2}>
                {intl.formatMessage({
                  id: "ceph.pool",
                  defaultMessage: " Distributed Storage  Pool",
                })}
              </h2>
              <CephPrimaryStoragePoolList
                view="sub.alarm"
                source={{
                  ...current,
                  labels,
                }}
                defaultQuery={{
                  conditions: [{ key: "uuid", op: Op.in, values: _uuids }],
                }}
              />
            </>
          );
        }

        return (
          <>
            <h2 className={style.h2}>
              {intl.formatMessage({
                id: "primaryStorage",
                defaultMessage: "Data Storage",
              })}
            </h2>
            <PrimaryStorageList
              view="sub.alarm"
              source={current}
              defaultQuery={{
                conditions: [{ key: "uuid", op: Op.in, values: uuids }],
              }}
            />
          </>
        );
      },
    },
    "ZStack/BaremetalVM": {
      getQuery: () => baremetalInstanceList,
      getList: () => BareMetalInstanceList,
      getComponent: (current, uuids: string[] = []) => {
        return (
          <>
            <h2 className={style.h2}>
              {intl.formatMessage({
                id: "baremetal.instance",
                defaultMessage: "Bare Metal Instance",
              })}
            </h2>
            <BareMetalInstanceList
              view="sub.alarm"
              source={current}
              defaultQuery={{
                conditions: [{ key: "uuid", op: Op.in, values: uuids }],
              }}
            />
          </>
        );
      },
    },
  };
  return { componentMap };
};

export default useComponentMap;
