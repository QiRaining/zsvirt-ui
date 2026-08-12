import { gql, useQuery } from "@apollo/client";
import { vmInstanceList } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { verifyCancelShare } from "@zstack/zsphere-components";
import { useActionConfig } from "@zstack/zsphere-engine/src/vm";
import type { IOption } from "@zstack/zsphere-engine/src/vm/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { useHandleHttpsDownload } from "@zstack/zsphere-hooks";
import { SchedulerJobStateEvent, VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  StartVmInstancePayload,
} from "@zstack/zsphere-types/graphql";
import { message } from "antd";
import { xor as _xor, includes } from "lodash-es";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import CancelShareAction from "zsv_administration_shared/account-information/action/cancel-share";
import SetShareTypeAction from "zsv_administration_shared/account-information/action/set-share-type";
import {
  VmBindBackUpJob,
  CreateBackupData,
} from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";
import { CreateAction as CreateSnapshotAction } from "zsv_data_protection_shared/snapshot/mf-index";

import { SetResourceAttribute } from "../../../components/resource-attribute";
import ChangeVmPasswordAction from "../action/advanced-action/change-vm-password";
import EditBootConfigAction from "../action/advanced-action/edit-boot-config";
import EditGuesttoolsConfigAction from "../action/advanced-action/edit-guesttools-config";
import EditNormalConfigAction from "../action/advanced-action/edit-normal-config";
import EditOtherConfigAction from "../action/advanced-action/edit-other-config";
import EditRemoteConfigAction from "../action/advanced-action/edit-remote-config";
import SetSshkeyAction from "../action/advanced-action/set-sshkey";
import AttachAlarmModal from "../action/alarm/attach-alarm-modal";
import AttachVmAction from "../action/backup-policy/attach-vm";
import DetachVmAction from "../action/backup-policy/detach-vm";
import DisableBackupJobAction from "../action/backup-policy/disable-backup-job";
import EditBackupPriorityAction from "../action/backup-policy/edit-backup-priority";
import BatchSnapshotAction from "../action/base/batch-snapshot";
import DeleteModal from "../action/base/delete-modal";
import ExpungeModal from "../action/base/expunge";
import FlattenModal from "../action/base/flatten-modal";
import ForceStopModal from "../action/base/force-stop-modal";
import PauseAction from "../action/base/pause-modal";
import PoweroffModal from "../action/base/poweroff-modal";
import RebootAction from "../action/base/reboot-modal";
import RecoverModal from "../action/base/recover-modal";
import ResumeAction from "../action/base/resume-modal";
import StopVmInstanceAction from "../action/base/stop-vm-instance";
import UpdateModal from "../action/base/update-modal";
import ChangeOwnerAction from "../action/change-owner";
import CloneAction from "../action/clone";
import EditConfigAction from "../action/edit-config/index";
import ExportModal from "../action/export-modal";
import DeleteExportedVmModal from "../action/export/delete-exported-vm-modal";
import GuestToolAction from "../action/guest-tool";
import CreateVmImageModal from "../action/image-and-snapshot/create-vm-image-modal";
import BatchChangeHostAction from "../action/migrate/batch-change-host";
import BatchChangeHostStorageAction from "../action/migrate/batch-change-host-storage";
import BatchChangeStorageAction from "../action/migrate/batch-change-storage";
import ChangePrimaryStorageAction from "../action/migrate/change-primary-storage";
import MigrateToHostAction from "../action/migrate/migrate-to-host";
import StorageMigrateModal from "../action/migrate/storage-migrate-modal";
import MoveToGroupAction from "../action/move-to-group/move-to-group";
import useOpenConsoleAction from "../action/open-console";
// shared start
import ShareResourceAction from "../action/share-resource";
import NicSyncConfigAction from "../action/system-config/nic-sync-config";
import ReimageModal from "../action/system-config/reimage-modal";
import Rekey from "../action/system-config/rekey";
import StartVmFromHostModal from "../action/system-config/start-vm-from-host-modal";
import AttachTagAction from "../action/tag/attach";
import DetachTagAction from "../action/tag/detach";
import TagManagementAction from "../action/tag/index";
import CloneWay from "../action/template/clone-way";
import ConverWay from "../action/template/conver-way";
import {
  verifyActionWithCdpRecover,
  verifyAttachBackupJob,
  verifyBackup,
  verifyChangeOwner,
  verifyClone,
  verifyCloneToTemplate,
  verifyConverToTemplate,
  verifyCreateBackupJob,
  verifyCreateImage,
  verifyCreateInstance,
  verifyDeleteVm,
  verifyDisableBackupJob,
  verifyDisasterRecoveryLicense,
  verifyEnableBackupJob,
  verifyForceStop,
  verifyInstallGuestTool,
  verifyIsShareable,
  verifyMigrate,
  verifyModifyVmPassword,
  verifyMultiSelect,
  verifyNicSyncConfig,
  verifyNotRunning,
  verifyOpenConsole,
  verifyPause,
  verifyPoweroff,
  verifyReInstallGuestTool,
  verifyReboot,
  verifyReimage,
  verifyResume,
  verifySingleSelect,
  verifySingleSelectWithUuid,
  verifyStart,
  verifyStartFromHost,
  verifyStop,
  verifyStorageMigrate,
  verifyVmFlatten,
  verifySingleVmMigrateChangePrimaryStorage,
  verifyWithGqa,
  verrifyVmStatusCanDeleteOrRemove,
  useVerifyPrimaryStorageCount,
  verifyRekey,
} from "../action/validators";
import AddVmToVmGroupAction from "../action/vm-scheduling-rule/vm-group/add-vm-to-vm-group";
import RemoveVmFromVmGroupAction from "../action/vm-scheduling-rule/vm-group/remove-vm-from-vm-group";
import CreateInstanceModal from "../create/enter-select-modal";

const startVmInstance = gql`
  mutation startVmInstance($input: StartVmInstanceInput!) {
    startVmInstance(input: $input) {
      actionId
    }
  }
`;

const updateAlarmLabel = gql`
  mutation updateAlarmLabel($input: UpdateAlarmLabelInput!) {
    updateAlarmLabel(input: $input) {
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

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
    }
  }
`;

export const downloadImageFile = (selectList: any, exportUrl?: string) => {
  const url = exportUrl || selectList?.[0].exportUrl;
  const aNode = document.createElement("a");
  aNode.setAttribute("type", "hidden");
  aNode.href = url;
  aNode.download = url;
  document.body.appendChild(aNode);
  aNode.click();
  aNode.remove();
};

export default () => {
  const intl = useIntl();
  const doAction = useAction();
  const openVncConsole = useOpenConsoleAction();
  const verifyPrimaryStorageCount = useVerifyPrimaryStorageCount();

  const { data: deletionPolicyData, loading: deletionPolicyLoading } = useQuery(
    GLOBAL_CONFIG,
    {
      variables: {
        category: "vm",
        name: "deletionPolicy",
      },
    },
  );

  const { handleHttpsDownload } = useHandleHttpsDownload();
  const copyToClip = useCallback(
    (selectList: any) => {
      const aux = document.createElement("input");
      const url = selectList?.[0].exportUrl;
      if (url) {
        aux.setAttribute("value", url);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
        message.success({
          content: intl.formatMessage({
            id: "image.action.copy.url.success.message",
            defaultMessage: "Successfully copied the URL.",
          }),
        });
      } else {
        message.warn({
          content: intl.formatMessage({
            id: "image.action.copy.url.warning.message",
            defaultMessage: "Failed to copy the URL.",
          }),
        });
      }
    },
    [intl],
  );

  const isDelay = useMemo(() => {
    if (deletionPolicyLoading) {
      return true;
    }
    return deletionPolicyData?.globalConfig?.value !== "Direct";
  }, [deletionPolicyData, deletionPolicyLoading]);

  const actionConfig: IOption<IVM> = useMemo<IOption<IVM>>(
    () => [
      {
        key: "virtualization.transform.to.template",
        validators: [
          verifyConverToTemplate,
          verifyClone, //实际上是看共享盘和RDM盘的数量，如果有，则不支持转换为模板
        ],
        ActionWrapper: ConverWay,
        tooltip: ({ selectedList }) => {
          if (!selectedList?.length) {
            return null;
          }

          const vm = selectedList?.[0];

          const stateFlag = includes([VmInstanceState.Stopped], vm.state);

          const shareableDiskAndLunFlag = !(
            (vm?.attachedShareableVolumeUuidList &&
              vm?.attachedShareableVolumeUuidList?.length > 0) ||
            vm.haveScsiLun
          );

          if (stateFlag && shareableDiskAndLunFlag) {
            return null;
          }

          if (stateFlag && !shareableDiskAndLunFlag) {
            return {
              title: (
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "instance.action.convert.to.templated.vm.disabled.tooltip.only.state",
                    defaultMessage:
                      "To convert a virtual machine to a template, detach all shared disks and RDM disks on the virtual machine.",
                  })}
                </ReactMarkdown>
              ),
              placement: "right",
            };
          }

          if (!stateFlag && shareableDiskAndLunFlag) {
            return {
              title: (
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "instance.action.convert.to.templated.vm.disabled.tooltip.only.disk",
                    defaultMessage:
                      "To convert a virtual machine to a template, make sure the virtual machine is shut down.",
                  })}
                </ReactMarkdown>
              ),
              placement: "right",
            };
          }

          return {
            title: (
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "instance.action.convert.to.templated.vm.disabled.tooltip",
                  defaultMessage:
                    "To convert a virtual machine to a template:\n\n1. Make sure the virtual machine is shut down.\n2. Detach all shared disks and RDM disks on the virtual machine.",
                })}
              </ReactMarkdown>
            ),
            placement: "right",
          };
        },
      },
      {
        key: "virtualization.clone.to.template",
        validators: [verifyCloneToTemplate, verifyClone],
        tooltip: ({ selectedList }) => {
          if (!selectedList?.length) {
            return null;
          }

          const vm = selectedList?.[0];

          const stateFlag = includes([VmInstanceState.Stopped], vm.state);

          const shareableDiskAndLunFlag = !(
            (vm?.attachedShareableVolumeUuidList &&
              vm?.attachedShareableVolumeUuidList?.length > 0) ||
            vm.haveScsiLun
          );

          if (stateFlag && shareableDiskAndLunFlag) {
            return null;
          }

          if (stateFlag && !shareableDiskAndLunFlag) {
            return {
              title: (
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "instance.action.clone.to.templated.vm.disabled.tooltip.only.state",
                    defaultMessage:
                      "To clone a virtual machine to a template, detach all shared disks and RDM disks on the virtual machine.",
                  })}
                </ReactMarkdown>
              ),
              placement: "right",
            };
          }

          if (!stateFlag && shareableDiskAndLunFlag) {
            return {
              title: (
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "instance.action.clone.to.templated.vm.disabled.tooltip.only.disk",
                    defaultMessage:
                      "To clone a virtual machine to a template, make sure the virtual machine is running, paused, shut down, or crashed.",
                  })}
                </ReactMarkdown>
              ),
              placement: "right",
            };
          }

          return {
            title: (
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "instance.action.clone.to.templated.vm.disabled.tooltip",
                  defaultMessage:
                    "To clone a virtual machine to a template:\n\n1. Make sure the virtual machine is running, paused, shut down, or crashed.\n2. Detach all shared disks and RDM disks on the virtual machine.",
                })}
              </ReactMarkdown>
            ),
            placement: "right",
          };
        },
        ActionWrapper: CloneWay,
      },
      {
        key: "virtualization.create.instance",
        autoInjectPreValidator: false,
        preValidators: [verifyCreateInstance],
        icon: "plus",
        ActionWrapper: CreateInstanceModal,
      },
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
        key: "virtualization.console",
        icon: "console",
        onClick: ({ selectedList, setSelectedList }) => {
          openVncConsole(selectedList?.[0], () => setSelectedList?.([]));
        },
        preValidators: [verifySingleSelectWithUuid],
        validators: [verifyOpenConsole],
      },
      {
        key: "virtualization.reboot",
        validators: [verifyReboot],
        ActionWrapper: RebootAction,
        tooltip: intl.formatMessage({
          id: "virtualization.vm.reboot.disabled.tooltip",
          defaultMessage: "You can reboot a VM that is in the running or crashed state. ",
        }),
        notSupportedModal: {
          title: intl.formatMessage({
            id: "vm.modal.title.cannot.reboot.vm",
            defaultMessage: "Cannot Reboot Virtual Machine",
          }),
        },
      },
      {
        key: "virtualization.pause",
        validators: [verifyPause],
        tooltip: intl.formatMessage({
          id: "virtualization.vm.pause.disabled.tooltip",
          defaultMessage: "You can pause a VM that is in the running state.",
        }),
        ActionWrapper: PauseAction,
        notSupportedModal: {
          title: intl.formatMessage({
            id: "vm.modal.title.cannot.pause.vm",
            defaultMessage: "Cannot Pause Virtual Machine",
          }),
        },
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
        key: "virtualization.move.to.trash",
        name: isDelay
          ? intl.formatMessage({
              id: "move.to.trash",
              defaultMessage: "Move to Recycle Bin",
            })
          : intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
        validators: [
          verifyActionWithCdpRecover,
          verifyDeleteVm,
          verrifyVmStatusCanDeleteOrRemove,
        ],
        tooltip: () => {
          return isDelay
            ? intl.formatMessage({
                id: "vm.action.delete.disabled.trash.tips",
                defaultMessage:
                  "VMs that are running, paused, crashed, or unkonwn cannot be moved to the recycle bin. Try again after VM shutdown.",
              })
            : intl.formatMessage({
                id: "vm.action.delete.disabled.delete.tips",
                defaultMessage:
                  "Virtual machines that are running, suspended, faulty, or unknown will not support deletion. Please try again after shutdown.",
              });
        },
        notSupportedModal: () => {
          return {
            title: isDelay
              ? intl.formatMessage({
                  id: "vm.modal.title.cannot.move.vm.to.trash",
                  defaultMessage: "Cannot Move to Recycle Bin",
                })
              : intl.formatMessage({
                  id: "vm.modal.title.cannot.delete.vm",
                  defaultMessage: "Cannot Move VM to Recycle Bin",
                }),
            itemName: "name",
            alertMessage: isDelay
              ? intl.formatMessage({
                  id: "vm.modal.trash.tips",
                  defaultMessage:
                    "VMs that are running, paused, crashed, or unkonwn cannot be moved to the recycle bin. Try again after VM shutdown.",
                })
              : intl.formatMessage({
                  id: "vm.modal.delete.tips",
                  defaultMessage:
                    "Virtual machines that are running, paused, failed, or in an unknown state do not support deletion. Please try again after shutting down.",
                }),
            alertType: "info",
          };
        },
        ActionWrapper: isDelay ? DeleteModal : ExpungeModal,
      },
      {
        key: "virtualization.create.image",
        validators: [verifyCreateImage],
        ActionWrapper: CreateVmImageModal,
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
      {
        key: "virtualization.export.ova.template",
        preValidators: [verifyMultiSelect],
        validators: [verifyStart, (vm) => vm.exportInfo === null],
        ActionWrapper: ExportModal,
        tooltip: ({ selectedList }) => {
          return selectedList?.[0]?.exportInfo !== null
            ? intl.formatMessage({
                id: "export.vm.export.info",
                defaultMessage:
                  "If the virtual machine has an export record, delete the record and then you can export this virtual machine.",
              })
            : null;
        },
      },
      {
        key: "virtualization.install.guest.tool",
        ActionWrapper: GuestToolAction,
        preValidators: [verifySingleSelect],
        validators: [verifyActionWithCdpRecover, verifyInstallGuestTool],
      },
      {
        key: "virtualization.reinstall.guest.tool",
        ActionWrapper: GuestToolAction,
        preValidators: [verifySingleSelect],
        validators: [verifyActionWithCdpRecover, verifyReInstallGuestTool],
      },
      {
        key: "virtualization.change.group",
        preValidators: [verifyMultiSelect],
        ActionWrapper: MoveToGroupAction,
      },
      {
        key: "virtualization.edit.name.and.description",
        validators: [verifyActionWithCdpRecover],
        ActionWrapper: UpdateModal,
      },
      {
        key: "virtualization.change.owner",
        validators: [verifyChangeOwner],
        ActionWrapper: ChangeOwnerAction,
      },
      {
        key: "virtualization.tag.management",
        ActionWrapper: TagManagementAction,
      },
      {
        key: "virtualization.set.resource.attribute",
        ActionWrapper: SetResourceAttribute,
      },
      {
        key: "virtualization.clone",
        preValidators: [verifySingleSelect],
        validators: [verifyClone],
        tooltip: ({ selectedList }) => {
          if (!selectedList?.length) {
            return null;
          }
          return {
            placement: "rightTop",
            title: (
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "vm.action.clone.disabled.tooltip",
                  defaultMessage:
                    "Unable to clone virtual machine, possibly due to:\n1. Lack of available image storage.\n2. The virtual machine is only supported for cloning when it is running, paused, shut down, or faulty.\n3. The virtual machine has mounted a shared disk or RDM disk and needs to be unmounted before performing this operation.",
                })}
              </ReactMarkdown>
            ),
          };
        },
        ActionWrapper: CloneAction,
      },
      {
        key: "virtualization.edit.config",
        preValidators: [verifySingleSelect],
        ActionWrapper: EditConfigAction,
      },
      {
        key: "virtualization.resume",
        validators: [verifyResume],
        tooltip: intl.formatMessage({
          id: "virtualization.vm.resume.disabled.tooltip",
          defaultMessage: "You can resume a VM that is in the paused state.",
        }),
        ActionWrapper: ResumeAction,
      },
      {
        key: "vm.group.add.vm",
        autoInjectPreValidator: false,
        ActionWrapper: AddVmToVmGroupAction,
      },
      {
        key: "vm.group.remove.vm",
        preValidators: [verifyMultiSelect],
        ActionWrapper: RemoveVmFromVmGroupAction,
      },
      {
        key: "virtualization.vm.flatten",
        validators: [verifyVmFlatten],
        tooltip: ({ selectedList }) => {
          const { state = VmInstanceState.Migrating } = selectedList?.[0] || {};
          if (
            ![
              VmInstanceState.Running,
              VmInstanceState.Paused,
              VmInstanceState.Stopped,
            ].includes(state)
          ) {
            return intl.formatMessage({
              id: "vm.action.flatten.disabled.state.tooltip",
              defaultMessage: "You can flatten a virtual machine that is in the running/stopped/paused state.",
            });
          }
          return null;
        },
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.vm.flatten.tooltip",
              defaultMessage: `Flat Merging

Flat merging refers to the process of combining multiple snapshots of resources into a single flat structure, enhancing resource performance and data security. Through flat merging, dependencies between virtual machines/hard drives and their source virtual machines/hard drives are resolved, achieving data independence.

Note:

1. If the selected resource has a large data volume, flat merging may require a longer time to complete.
2. Any other operations performed on the virtual machine/hard drive during the flat merging process will be executed after the process is completed.
3. After flat merging is complete, the cloned virtual machine/hard drive may occupy more storage space.
4. Flat merging a virtual machine will also merge its mounted data hard drives simultaneously; if the virtual machine mounts shared hard drives, only the virtual machine will be merged.

Usage Limitations:

1. Only virtual machines in a running, stopped, or paused state support flat merging.
2. Disconnected hard drives and shared hard drives do not support flat merging.`,
            })}
          </ReactMarkdown>
        ),
        ActionWrapper: FlattenModal,
      },
      //single migrate
      {
        key: "virtualization.migrate.change.host",
        ActionWrapper: MigrateToHostAction,
        preValidators: [verifySingleSelect],
        validators: [verifyMigrate],
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.migrate.action.migrate.host.tooltip",
              defaultMessage: `### Change Host

Migrate a virtual machine to another host. This action only changes the host where the virtual machine runs.

1. Hot migration migrates a running virtual machine. This action mainly copies the CPU register status and memory information. Supported storage: local storage, NFS, distributed storage, SAN storage.

2. Cold migration migrates a powered-off virtual machine. Supported storage: local storage.

3. Before you cold/hot migrate a virtual machine, detach the data disks, ISOs, or peripheral devices (if any) from the virtual machine first. If the virtual machine uses a local storage, you can hot or cold migrate the virtual machine with local data disks attached. If the virtual machine uses a shared storage, you can hot migrate the virtual machine with shared disks attached.

4. If vNUMA is enabled for a virtual machine, before you hot migrate the virtual machine, make sure that the pNUMA architecture of the destination host is consistent with that of the source host.

5. Before you hot migrate a virtual machine with VF NICs attached, note that:

    - Make sure the virtual machine has VMTools installed and the VMTools is running.

    - VF NIC VM migration may fail if the internal driver version of the VM is too low. Check and update the driver version as needed.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        key: "virtualization.change.host.and.data.storage",
        preValidators: [verifySingleSelect, verifyPrimaryStorageCount],
        validators: [verifyStorageMigrate],
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.change.host.and.data.storage.tooltip",
              defaultMessage: `### Change Host and Data Storage

Migrate a virtual machine to another host and data storage.

#### Hot Migration

- Supported Storage

  1. Hot migration across data storage of the same type: local storage↔local storage, ZCE distributed storage↔ZCE distributed storage, NFS↔NFS, SAN storage↔SAN storage, and local storage↔local storage.
  2. Hot migration across data storage of different types: ZCE distributed storage↔SAN storage, local storage↔SAN storage, local storage↔ZCE distributed storage, local storage↔NFS, SAN storage↔NFS, and ZCE distributed storage↔NFS.
  3. Hot migration across storage pools within the same ZCE distributed storage.

- Notes

  1. Before you migrate a virtual machine, detach the shared disks from the virtual machine first.
  2. If vNUMA is enabled for a virtual machine, the virtual machine will be migrated only to a host that has the same pNUMA architecture of the source host.
  3. Before you hot migrate a virtual machine with VF NICs attached, note that:

      - Make sure the virtual machine has VMTools installed and the VMTools is running.
      -  VF NIC VM migration may fail if the internal driver version of the VM is too low. Check and update the driver version as needed.
  4. For hot migration across data storage of the same type and different types, you can only migrate the entire virtual machine. For hot migration across storage pools within the same ZCE distributed storage, you can migrate the disk 1 only or the entire virtual machine.
  5. Before you hot migrate a virtual machine across ZCE distributed storage, make sure that the monitor nodes of these two ZCE distributed storage can communicate with each other.
  6. If you hot migrate a virtual machine across ZCE distributed storage, you can specify disk 1 storage pool.
  7. If you hot migrate a virtual machine from a SAN storage, local storage, or an NFS storage to a ZCE distributed storage, you can specify a disk 1 storage pool or data disk pool for the disks to be migrated.

#### Cold Migration

- Supported Storage

  1. Cold migration across data storage of the same type: ZCE distributed storage↔ZCE distributed storage, NFS↔NFS.
  2. Cold migration across storage pools within the same ZCE distributed storage.

- Notes

  1. The virtual machine needs to be shut down and detach all its data disks.
  2. Before you migrate a virtual machine, detach the shared disks from the virtual machine first.
  3. For ZCE distributed storage↔ZCE distributed storage cold migration: If you set a cold migration network for the target data storage, the virtual machine is migrated through the cold migration network. Otherwise, the virtual machine is migrated through the management network.
  4. For NFS↔NFS cold migration: The destination NFS storage can be attached to the cluster where the virtual machine to be migrated is located.`,
            })}
          </ReactMarkdown>
        ),
        ActionWrapper: StorageMigrateModal,
      },
      {
        key: "virtualization.change.data.storage",
        preValidators: [verifySingleSelect, verifyPrimaryStorageCount],
        validators: [verifySingleVmMigrateChangePrimaryStorage],
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.change.data.storage.tooltip",
              defaultMessage: `### Change Data Storage

Migrate a virtual machine to another data storage. This action only changes data storage.

#### Supported Storage

- SAN storage ↔ SAN storage hot migration
- SAN storage ↔ SAN storage cold migration
- SAN storage ↔ ZCE disributed storage hot migration

#### Notes

1. You can migrate the whole virtual machine with data disks attached.
2. Before you migrate a virtual machine, detach the ISOs, LUN devices, or shared disks from the virtual machine first.
3. Make sure that the source and destination data storage are in the same cluster.
4. If you hot migrate a virtual machine from a SAN storage to a ZCE distributed storage, you can specify a root disk pool and data disk pool for the disks to be migrated.
5. Before you hot migrate a virtual machine with VF NICs attached, note that:

    - Make sure the virtual machine has VMTools installed and the VMTools is running.

    - VF NIC VM migration may fail if the internal driver version of the VM is too low. Check and update the driver version as needed.`,
            })}
          </ReactMarkdown>
        ),
        ActionWrapper: ChangePrimaryStorageAction,
      },
      //batch migrate
      {
        key: "virtualization.batch.migrate.host",
        preValidators: [verifyMultiSelect],
        ActionWrapper: BatchChangeHostAction,
      },
      {
        key: "virtualization.batch.change.data.storage",
        preValidators: [verifyMultiSelect],
        ActionWrapper: BatchChangeStorageAction,
      },
      {
        key: "virtualization.batch.change.host.and.data.storage",
        preValidators: [verifyMultiSelect],
        ActionWrapper: BatchChangeHostStorageAction,
      },
      //batch snapshot
      {
        key: "virtualization.batch.create.snapshot",
        preValidators: [verifyMultiSelect],
        ActionWrapper: BatchSnapshotAction,
      },
      {
        key: "virtualization.reset.vm",
        ActionWrapper: ReimageModal,
        validators: [verifyReimage],
      },
      {
        key: "virtualization.tag.attach.vm",
        autoInjectPreValidator: false,
        ActionWrapper: AttachTagAction,
      },
      {
        key: "virtualization.tag.detach.vm",
        ActionWrapper: DetachTagAction,
      },
      {
        key: "virtualization.edit.vm.normal.config",
        ActionWrapper: EditNormalConfigAction,
      },
      {
        key: "virtualization.edit.vm.remote.console",
        tooltip: intl.formatMessage({
          id: "disable.vm.edit.action.with.running",
          defaultMessage: "Cannot modify this setting when the VM is running. Power off the VM and try again.",
        }),
        validators: [verifyNotRunning],
        ActionWrapper: EditRemoteConfigAction,
      },
      {
        key: "virtualization.set.sshkey",
        validators: [verifyNotRunning],
        tooltip: intl.formatMessage({
          id: "disable.vm.edit.action.with.running",
          defaultMessage: "Cannot modify this setting when the VM is running. Power off the VM and try again.",
        }),
        ActionWrapper: SetSshkeyAction,
      },
      {
        key: "virtualization.change.vm.password",
        validators: [verifyModifyVmPassword, verifyWithGqa],
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.action.modify.vm.password.tooltis",
              defaultMessage: `
### Modify VM Pasword

Before you can modify the password of a virtual machine, make sure that:

1. The virtual machine is in Running state.
2. QEMU Guest Agent (QGA) is installed on the virtual machine and is running. You can install VM GuestTools to install QGA.
`,
            })}
          </ReactMarkdown>
        ),
        tooltip: ({ selectedList }) => {
          if (
            selectedList?.every(
              (vm) => !["Running", "Crashed"].includes(vm.state!),
            )
          ) {
            return intl.formatMessage({
              id: "vm.action.change.vm.password.disabled.with.error.state.tooltip",
              defaultMessage:
                "This feature does not support modifying virtual machine passwords while the VM is shut down. Please boot up the VM and ensure QGA is installed before making any changes.",
            });
          }
          if (
            selectedList?.every(
              (vm) => vm.guestToolsState?.qgaState !== "Running",
            )
          ) {
            return intl.formatMessage({
              id: "vm.action.change.vm.password.disabled.with.no.qga.tooltip",
              defaultMessage: "Please install QGA and modify afterwards.",
            });
          }
          return;
        },
        ActionWrapper: ChangeVmPasswordAction,
      },
      {
        key: "virtualization.edit.vm.tools.config",
        ActionWrapper: EditGuesttoolsConfigAction,
      },
      {
        key: "virtualization.edit.boot.config",
        validators: [verifyNotRunning],
        tooltip: intl.formatMessage({
          id: "disable.vm.edit.action.with.running",
          defaultMessage: "Cannot modify this setting when the VM is running. Power off the VM and try again.",
        }),
        ActionWrapper: EditBootConfigAction,
      },
      {
        key: "virtualization.edit.other.config",
        ActionWrapper: EditOtherConfigAction,
      },
      {
        key: "virtualization.nic.sync.config",
        ActionWrapper: NicSyncConfigAction,
        validators: [verifyNicSyncConfig],
      },
      {
        key: "attach.alarm",
        autoInjectPreValidator: false,
        ActionWrapper: AttachAlarmModal,
      },
      {
        key: "detach.alarm",
        preValidators: [verifyMultiSelect],
        onClick: ({ source, selectedList, setSelectedList }) => {
          const labels = source?.labels;
          const key = labels?.[0]?.key;
          const labelUuid = labels[0].uuid;
          const oldValue = labels[0].value;
          const selectedUuids = selectedList?.map((cv) => cv?.uuid);
          const value = _xor(oldValue.split("|"), selectedUuids).join("|");
          const payload = {
            uuid: labelUuid,
            key,
            value,
            operator: "Regex",
          };
          doAction({
            mutation: updateAlarmLabel,
            payload,
            name: intl.formatMessage({
              id: "remove.resource",
              defaultMessage: "Remove Resources",
            }),
            total: 1,
            onFinish: () => {
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        key: "expunge",
        icon: "trash-fill",
        iconStyle: {
          color: "#F4454C",
          width: "14px",
        },
        ActionWrapper: ExpungeModal,
      },
      {
        key: "recover",
        icon: "redo-fill",
        iconStyle: {
          color: "#5ACA49",
          width: "14px",
        },
        ActionWrapper: RecoverModal,
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
        ActionWrapper: VmBindBackUpJob,
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
        ActionWrapper: CreateBackupData,
      },
      {
        key: "editBackupPriority",
        ActionWrapper: EditBackupPriorityAction,
      },
      {
        key: "virtualization.backup.job.enable",
        preValidators: [verifyMultiSelect],
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
        preValidators: [verifyMultiSelect],
        validators: [verifyDisableBackupJob],
        ActionWrapper: DisableBackupJobAction,
      },
      {
        key: "share.resource",
        autoInjectPreValidator: false,
        ActionWrapper: ShareResourceAction,
      },
      {
        key: "cancel.share",
        validators: [verifyCancelShare],
        ActionWrapper: CancelShareAction,
      },
      {
        key: "set.share.type",
        ActionWrapper: SetShareTypeAction,
      },
      {
        key: "virtualization.assign.start.host",
        ActionWrapper: StartVmFromHostModal,
        validators: [verifyStartFromHost],
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.action.assign.start.host.description",
              defaultMessage: `### Specify Host to Start

Power on your virtual machine on the specified host.

- The virtual machine needs to shut down.
- You can perform this operation on a virtual machine that uses shared storage.
- You cannot specify a host to start the virtual machine if it is associated with a scheduling policy. The virtual machine will be scheduled primarily based on the policy.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        key: "vm.export.download",
        preValidators: [verifySingleSelect],
        onClick: ({ selectedList }) => {
          if (window.location.protocol === "https:") {
            handleHttpsDownload((selectedList[0] as any)?.exportUrl);
          } else {
            downloadImageFile(selectedList);
          }
        },
      },
      {
        key: "vm.export.url",
        preValidators: [verifySingleSelect],
        onClick: ({ selectedList }) => copyToClip(selectedList),
      },
      {
        key: "vm.export.delete",
        icon: "trash",
        ActionWrapper: DeleteExportedVmModal,
      },
      {
        key: "update.data.encryption.key",
        validators: [verifyRekey],
        ActionWrapper: Rekey,
        notSupportedModal: {
          alertType: "info",
          alertMessage: intl.formatMessage({
            id: "vm.rekey.not.support.modal.alert",
            defaultMessage:
              "The rekey operation only applies to VMs that have TPM configured or other encryption features enabled.",
          }),
          title: intl.formatMessage({
            id: "vm.rekey.not.support.modal.title",
            defaultMessage: "Cannot Rekey",
          }),
        },
      },
    ],
    [intl, isDelay],
  );

  const config = useActionConfig<IVM>(actionConfig);

  return { ...config, gql: vmInstanceList };
};
