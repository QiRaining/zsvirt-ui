import { Button } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useActionConfig } from "@zstack/zsphere-engine/src/zsv-backup-data";
import type { IOption } from "@zstack/zsphere-engine/src/zsv-backup-data/useActionConfig";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { BackupData as IBackupData } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import VmCreateBackup from "../action/create-backup";
import DeleteBackupData from "../action/delete-backupData";
import VmRevert from "../action/revert";
import SyncToLocalBackupStorage from "../action/sync-to-local-backupStorage";
import SyncToRemoteBackupStorage from "../action/sync-to-remote-backupStorage";
import {
  verifyCanSyncToRemote,
  verifyCanSyncToLocal,
  verifyDisasterRecoveryLicense,
  verifyDestroyedVM,
} from "../action/validator";

export default (options: IOption = []) => {
  const intl = useIntl();
  return useActionConfig<IBackupData>([
    {
      key: "create.backup",
      autoInjectPreValidator: false,
      preValidators: [verifyDisasterRecoveryLicense],
      ActionWrapper: (props) => {
        const { visible, setVisible, view, position, source } = props;
        return (
          <VmCreateBackup
            view={view}
            position={position}
            visible={visible}
            setVisible={setVisible}
            selectedList={[]}
            source={source}
          />
        );
      },
      extraRender: ({ source, onClick }) => {
        const { state: vmState = VmInstanceState.Destroyed, primaryStorage } =
          source || {};

        //回收站的虚拟机
        if (vmState === VmInstanceState.Destroyed) {
          return (
            <Button
              key="create.backup"
              icon={<Icon type="plus" />}
              disabled
              variant="secondary"
            >
              {intl.formatMessage({
                id: "backup.create.backup",
                defaultMessage: "Create Backup",
              })}
            </Button>
          );
        }

        //Vhost 存储不支持创建备份
        if (primaryStorage?.defaultProtocol === "Vhost") {
          return (
            <Tooltip
              title={intl.formatMessage({
                id: "vhost.ps.not.support.create.backup",
                defaultMessage: "You cannot create backups for this VM, because the VM disks are stored on ZHPS distributed storage.",
              })}
            >
              <Button
                key="create.backup"
                icon={<Icon type="plus" />}
                disabled
                variant="secondary"
              >
                {intl.formatMessage({
                  id: "backup.create.backup",
                  defaultMessage: "Create Backup",
                })}
              </Button>
            </Tooltip>
          );
        }

        //正常状态
        return (
          <Button
            key="create.backup"
            icon={<Icon type="plus" />}
            variant="secondary"
            onClick={() => onClick?.()}
          >
            {intl.formatMessage({
              id: "backup.create.backup",
              defaultMessage: "Create Backup",
            })}
          </Button>
        );
      },
    },
    {
      key: "overwrite.recovery",
      icon: "undo",
      validators: [verifyDestroyedVM],
      ActionWrapper: VmRevert,
    },
    {
      key: "sync.to.remote.backup.storage",
      preValidators: [verifyCanSyncToRemote],
      validators: [verifyDisasterRecoveryLicense],
      ActionWrapper: SyncToRemoteBackupStorage,
    },
    {
      key: "sync.to.local.backup.storage",
      preValidators: [verifyCanSyncToLocal],
      validators: [verifyDisasterRecoveryLicense],
      ActionWrapper: SyncToLocalBackupStorage,
    },
    {
      key: "delete",
      ActionWrapper: DeleteBackupData,
    },
    ...options,
  ]);
};
