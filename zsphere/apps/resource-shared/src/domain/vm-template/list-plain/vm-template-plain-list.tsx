import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { VmTemplate as IVMTemplate } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const QUERY_TEMPLATED_VM_INSTANCE_LIST = gql`
  fragment vmInstanceFields on VmInstance {
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
    toolsState
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
    guestToolsState {
      osType
      platform
      qgaState
      version
      zwatchState
      vmInstanceUuid
    }
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
    toolsInfo {
      lowVersion
      version
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

  query templatedVmInstanceList(
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
        isTemplate
        tpmList {
          uuid
          vmInstanceUuid
        }
        ...vmInstanceFields
      }
    }
  }
`;

export interface IVMTemplatePlainListProps extends Omit<
  ITableListProps<IVMTemplate>,
  "gql"
> {
  toolbar?: ITableListProps<IVMTemplate>["toolbar"];
  gql?: DocumentNode;
}

const VmTemplatePlainList: React.FC<IVMTemplatePlainListProps> = ({
  actionConfig,
  columnConfig,
  queryConfig,
  gql,
  toolbar,
  ...props
}) => {
  const defaultQueryConfig = useQueryConfig({
    view: props.view,
    defaultQuery: props.defaultQuery,
  });

  const defaultColumnConfig = useColumnConfig();

  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IVMTemplate>["actionConfig"];

  return (
    <TableList
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={gql || QUERY_TEMPLATED_VM_INSTANCE_LIST}
      type="VmTemplate"
      resource="vm.template"
      toolbar={toolbar || ["refresh", "search", "operation"]}
      {...props}
    />
  );
};

export default VmTemplatePlainList;
