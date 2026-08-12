import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/vm";
import type { IOption } from "@zstack/zsphere-engine/src/vm/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  StartVmInstancePayload,
} from "@zstack/zsphere-types/graphql";
import { xor as _xor } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import {
  StopVmInstanceAction,
  verifyStart,
  verifyStop,
} from "zsv_resource_shared/vm/mf-index";

import CreateSnapshotAction from "../action/create";
import { verifyIsShareable } from "../action/validator";

const startVmInstance = gql`
  mutation startVmInstance($input: StartVmInstanceInput!) {
    startVmInstance(input: $input) {
      actionId
    }
  }
`;

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
        # cdpTaskStatus
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

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const actionConfig: IOption<IVM> = useMemo<IOption<IVM>>(
    () => [
      {
        key: "virtualization.start",
        icon: "play-circle-fill",
        iconStyle: {
          color: "#5ACA49",
        },
        validators: [verifyStart],
        tooltip: intl.formatMessage({
          id: "virtualization.vm.start.disabled.tooltip",
          defaultMessage: "You can power on a VM that is in the powered off state. ",
        }),
        onClick: ({ selectedList, setSelectedList }) => {
          const payload: StartVmInstancePayload[] = selectedList.map((item) => {
            return { uuid: item.uuid };
          });
          doAction({
            mutation: startVmInstance,
            payload,
            name: intl.formatMessage({
              id: "start.vm",
              defaultMessage: "Power On VM",
            }),
            total: selectedList.length,
            type: "VmInstance",
            middleState: {
              type: "VmInstance",
              field: "state",
              data: { state: VmInstanceState.Starting },
              uuids: selectedList.map((item) => item.uuid),
            },
            onFinish: () => {
              setSelectedList?.([]);
            },
          });
        },
        notSupportedModal: {
          title: intl.formatMessage({
            id: "vm.modal.title.cannot.start.vm",
            defaultMessage: "Cannot Power On VM",
          }),
        },
      },
      {
        key: "virtualization.stop",
        icon: "stop-circle-fill",
        iconStyle: {
          color: "#F4454C",
        },
        notSupportedModal: {
          title: intl.formatMessage({
            id: "vm.modal.title.cannot.stop.vm",
            defaultMessage: "Cannot Shut Down VM",
          }),
        },
        tooltip: intl.formatMessage({
          id: "virtualization.vm.stop.disabled.tooltip",
          defaultMessage: "You can shut down a VM that is in the running, paused, or crashed state.",
        }),
        validators: [verifyStop],
        ActionWrapper: StopVmInstanceAction,
      },
      {
        key: "virtualization.create.snapshot",
        validators: [verifyIsShareable],
        tooltip: ({ selectedList, source }) => {
          const { attachedShareableVolumeUuidList = [], haveScsiLun } =
            selectedList?.[0] || source || {};
          if (attachedShareableVolumeUuidList?.length > 0) {
            return intl.formatMessage({
              id: "virtualization.vm.have.shareable.tips",
              defaultMessage: "The current virtual machine has shared disks attached and cannot create a snapshot.",
            });
          }
          if (haveScsiLun) {
            return intl.formatMessage({
              id: "vm.action.create.snapshot.with.rdm.volume",
              defaultMessage: "The virtual machine exists on RDM disk, and cannot create a snapshot.",
            });
          }
          return "";
        },
        ActionWrapper: CreateSnapshotAction,
      },
    ],
    [intl],
  );

  const config = useActionConfig<IVM>(actionConfig);

  return { ...config, gql: vmInstanceList };
};
