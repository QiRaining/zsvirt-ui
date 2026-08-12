import { useLazyQuery, gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmQueryType } from "@zstack/zsphere-types";
import type {
  SnapshotStrategy,
  VmInstance,
  VmInstanceList as IVmInstanceList,
  UpdateSnapshotStrategyPayload,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import dayjs from "dayjs";
import { differenceBy, intersectionBy } from "lodash-es";
import { useEffect, useRef, useMemo } from "react";
import { useIntl } from "react-intl";

import type { IForm } from "../components/form";
import SnapshotStrategyForm from "../components/form";
import { formatCron, parseCron } from "../util";

import style from "../components/style.module.less";

const updateSnapshotStrategy = gql`
  mutation updateSnapshotStrategy($input: UpdateSnapshotStrategyInput!) {
    updateSnapshotStrategy(input: $input) {
      actionId
    }
  }
`;

const VM_INSTANCE_LIST = gql`
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

export default function Edit({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SnapshotStrategy>) {
  const intl = useIntl();
  const initialVmsRef = useRef<VmInstance[]>([]);
  const [form] = Form.useForm<IForm>();
  const doAction = useAction();

  const current = selectedList[0];
  const trigger = current?.triggers?.[0];

  const title = intl.formatMessage({
    id: "snapshot.strategy.editConfig.title",
    defaultMessage: "Modify Configuration",
  });

  const initialValues = useMemo<IForm>(() => {
    const cronParam = trigger && parseCron(trigger.cron);
    const result: IForm = {
      name: current?.name,
      description: current?.description,
      startTime: trigger && dayjs(new Date(trigger.startTime)).second(0),
      endTimeType: "never",
      snapshotCount: JSON.parse(current?.jobData ?? "{}")
        .snapshotGroupMaxNumber,
      attachedVm: [],
      periodByWeek: [1],
      periodByMonth: [1],
      monthInterval: 1,
      executeTime: cronParam?.executeTime,
      periodType: "week",
    };
    if (cronParam?.periodByWeek?.length) {
      result.periodByWeek = cronParam.periodByWeek;
      result.periodType = "week";
    } else if (cronParam?.monthInterval && cronParam.periodByMonth?.length) {
      result.monthInterval = cronParam.monthInterval;
      result.periodByMonth = cronParam.periodByMonth;
      result.periodType = "month";
    }
    if (trigger?.stopTime) {
      result.endTimeType = "custom";
      result.endTime = dayjs(new Date(trigger.stopTime)).second(0);
    }
    return result;
  }, [current, trigger]);

  const [queryAttachedVm] = useLazyQuery<{ vmInstanceList?: IVmInstanceList }>(
    VM_INSTANCE_LIST,
    {
      fetchPolicy: "no-cache",
      onCompleted: (data) => {
        const attachedVm = data?.vmInstanceList?.list;
        if (attachedVm?.length) {
          form.setFieldsValue({ attachedVm });
          initialVmsRef.current = attachedVm;
        }
      },
    },
  );

  const handleModalVisible = usePersistFn(() => {
    form.setFieldsValue(initialValues);
    if (!trigger) {
      form.setFieldsValue({ periodType: "week", periodByWeek: [] });
    }
    initialVmsRef.current = [];
    queryAttachedVm({
      variables: {
        type: VmQueryType.GetInstanceWithSnapshotStrategy,
        extraConditions: [
          { key: "__schedulerJobGroupUuid__", value: current?.uuid ?? "" },
        ],
      },
    });
  });

  useEffect(() => {
    if (visible) {
      handleModalVisible();
    }
  }, [visible, handleModalVisible]);

  const handleSubmit = (data: IForm) => {
    const commonVm = intersectionBy(
      initialVmsRef.current,
      data.attachedVm ?? [],
      "uuid",
    );
    const addedVm = differenceBy(data.attachedVm ?? [], commonVm, "uuid");
    const removedVm = differenceBy(initialVmsRef.current, commonVm, "uuid");

    const payload: UpdateSnapshotStrategyPayload = {
      schedulerJobGroupUuid: current?.uuid ?? "",
      triggerUuid: trigger?.uuid,
      name: data.name,
      description: data.description,
      snapshotGroupMaxNumber: data.snapshotCount,
      rootVolumeUuids: addedVm.map((vm) => vm.rootVolumeUuid!),
      removeJobUuids: removedVm
        .map((vm) => vm.snapshotSchedulerJob?.[0].uuid)
        .filter((uuid): uuid is string => !!uuid),
    };
    if (data.snapshotCount !== initialValues.snapshotCount) {
      payload.shouldUpdateSnapshotGroupMaxNumber = true;
    }

    const newCron = formatCron({
      executeTime: data.executeTime,
      startTime: data.startTime,
      monthInterval: data.monthInterval,
      periodByMonth: data.periodByMonth,
      periodByWeek: data.periodByWeek,
    });
    if (newCron !== trigger?.cron) {
      payload.cron = newCron;
    }

    const newStartTime = dayjs(data.startTime).second(0);
    if (
      !initialValues.startTime ||
      !newStartTime.isSame(initialValues.startTime)
    ) {
      payload.cron = newCron;
      payload.startTime = Math.floor(Number(newStartTime) / 1000);
    }

    const newEndTime = data.endTime && dayjs(data.endTime).second(0);
    if (newEndTime !== initialValues.endTime) {
      if (!newEndTime) {
        payload.cron = newCron;
        payload.endTime = 0;
      } else if (!initialValues.endTime?.isSame(newEndTime)) {
        payload.cron = newCron;
        payload.endTime = Math.floor(Number(newEndTime) / 1000);
      }
    }

    doAction({
      mutation: updateSnapshotStrategy,
      payload: [payload],
      name: title,
      total: 1,
      type: "SnapshotStrategy",
      onFinish: (result) => {
        if (
          result.success === result.total &&
          (addedVm.length || removedVm.length)
        ) {
          // 更新关联虚拟机列表 TableList
          bus.emit("action:refetch:VmInstance");
        }
      },
    });
  };

  return (
    <DialogForm
      className={style.formModal}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={handleSubmit as any}
      title={title}
      resourceName={current?.name}
    >
      <SnapshotStrategyForm
        form={form}
        initialValues={initialValues}
        type="edit"
      />
    </DialogForm>
  );
}
