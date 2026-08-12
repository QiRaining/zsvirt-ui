import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/vm";
import type { IOption } from "@zstack/zsphere-engine/src/vm/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { SchedulerJobStateEvent, VmInstanceState } from "@zstack/zsphere-types";
import type {
  StartVmInstancePayload,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import {
  CreateBackupData,
  verifyCreateBackupJob,
} from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";
import {
  ForceStopModal,
  PoweroffModal,
  StopVmInstanceAction,
  verifyForceStop,
  verifyPoweroff,
  verifyStart,
  verifyStop,
} from "zsv_resource_shared/vm/mf-index";

import AttachVmAction from "../action/attach-vm";
import DetachVmAction from "../action/detach-vm";
import DisableBackupJobAction from "../action/disable-backup-job";
import EditBackupPriorityAction from "../action/edit-backup-priority";
import {
  verifyDisableBackupJob,
  verifyEnableBackupJob,
} from "../action/validators";

const startVmInstance = gql`
  mutation startVmInstance($input: StartVmInstanceInput!) {
    startVmInstance(input: $input) {
      actionId
    }
  }
`;

const changeSchedulerJobState = gql`
  mutation changeSchedulerJobState($input: ChangeSchedulerJobStateInput!) {
    changeSchedulerJobState(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const options: IOption<IVM> = [
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
        const payload: StartVmInstancePayload[] = selectedList.map((item) => ({
          uuid: item.uuid,
        }));
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
      key: "virtualization.force.stop",
      validators: [verifyForceStop],
      tooltip: intl.formatMessage({
        id: "virtualization.vm.force.stop.disabled.tooltip",
        defaultMessage: "You can force stop a VM that is in the unknown state.",
      }),
      ActionWrapper: ForceStopModal,
      notSupportedModal: {
        title: intl.formatMessage({
          id: "vm.modal.title.cannot.forceStop.vm",
          defaultMessage: "Cannot Force Stop VM",
        }),
      },
    },
    {
      key: "virtualization.shutdown",
      validators: [verifyPoweroff],
      tooltip: intl.formatMessage({
        id: "virtualization.vm.shutdown.disabled.tooltip",
        defaultMessage: "You can power off a VM that is in the running or paused state.",
      }),
      ActionWrapper: PoweroffModal,
      notSupportedModal: {
        title: intl.formatMessage({
          id: "vm.modal.title.cannot.poweroff.vm",
          defaultMessage: "Cannot Power Off VM",
        }),
      },
    },
    {
      key: "virtualization.backup.job.enable",
      validators: [verifyEnableBackupJob],
      onClick: ({ selectedList }) => {
        const payload = selectedList.map((item) => ({
          uuid: item.backupJob?.uuid,
          stateEvent: SchedulerJobStateEvent.enable,
        }));
        doAction({
          mutation: changeSchedulerJobState,
          payload,
          name: intl.formatMessage({
            id: "enable.backup.job",
            defaultMessage: "Enable Backup Job",
          }),
          total: selectedList.length,
          type: "VmInstance",
        });
      },
    },
    {
      key: "virtualization.backup.job.disable",
      validators: [verifyDisableBackupJob],
      ActionWrapper: DisableBackupJobAction,
    },
    {
      key: "virtualization.create.backup.vm",
      validators: [verifyCreateBackupJob],
      tooltip: ({ selectedList }) => {
        if (
          selectedList?.every(
            (vm) => vm.primaryStorage?.defaultProtocol === "Vhost",
          )
        ) {
          return intl.formatMessage({
            id: "vhost.ps.not.support.create.backup",
            defaultMessage: "You cannot create backups for this VM, because the VM disks are stored on ZHPS distributed storage.",
          });
        }
        return undefined;
      },
      ActionWrapper: CreateBackupData,
    },
    {
      key: "editBackupPriority",
      ActionWrapper: EditBackupPriorityAction,
    },
    {
      key: "backupPolicyAttachVm",
      autoInjectPreValidator: false,
      ActionWrapper: AttachVmAction,
    },
    {
      key: "backupPolicyDetachVm",
      ActionWrapper: DetachVmAction,
    },
  ];

  return useActionConfig<IVM>(options);
};
