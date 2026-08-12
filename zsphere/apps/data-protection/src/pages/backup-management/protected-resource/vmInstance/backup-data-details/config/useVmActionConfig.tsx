import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/vm";
import { useAction } from "@zstack/zsphere-hooks";
import { VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  StartVmInstancePayload,
} from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import {
  VmBindBackUpJob as BindBackupPlanAction,
  CreateBackupData as CreateBackupAction,
  verifyAttachBackupJob,
  verifyBackup,
  verifyCreateBackupJob,
  verifyDisasterRecoveryLicense,
} from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";
import {
  verifyStart,
  verifyStop,
  StopVmInstanceAction,
} from "zsv_resource_shared/vm/mf-index";

const startVmInstance = gql`
  mutation startVmInstance($input: StartVmInstanceInput!) {
    startVmInstance(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  return useActionConfig<IVM>([
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
      key: "virtualization.vm.bind.backup.job",
      validators: [
        verifyBackup,
        verifyAttachBackupJob,
        verifyDisasterRecoveryLicense,
      ],
      name: intl.formatMessage({
        id: "vm.action.bind.backup.policy",
        defaultMessage: "Associate Backup Plan",
      }),
      tooltip: ({ selectedList }) => {
        if (
          selectedList?.every(
            (vm) => vm.primaryStorage?.defaultProtocol === "Vhost",
          )
        ) {
          return intl.formatMessage({
            id: "vhost.ps.not.support.bind.backup",
            defaultMessage: "You cannot associate a back plan with this VM, because the VM disks are stored on ZHPS distributed storage.",
          });
        }
        return;
      },
      description: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vm.action.bind.backup.policy.description",
            defaultMessage:
              "### Associate Backup Plan\n\n1. You can associate backup plans with virtual machines that are not yet associated with any backup plans.\n2. If the authorized quota of the backup service is insufficient, no backup plan can be associated.",
          })}
        </ReactMarkdown>
      ),
      ActionWrapper: BindBackupPlanAction,
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
        return;
      },
      ActionWrapper: CreateBackupAction,
    },
  ]);
};
