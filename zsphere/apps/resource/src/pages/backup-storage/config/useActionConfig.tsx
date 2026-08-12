import { gql } from "@apollo/client";
import {
  updateAlarmLabel,
  backupStorageList,
} from "@zstack/virtualization-resource/src/gql/backup-storage.gql";
import { useActionConfig as _useActionConfig } from "@zstack/zsphere-engine/src/backup-storage";
import { useAction } from "@zstack/zsphere-hooks";
import {
  BackupStorageStateEvent as IBackupStorageStateEvent,
  TrashQueryType as ITrashQueryType,
  BackupStorageType,
} from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  ChangeBackupStorageStatePayload as IChangeBackupStorageStatePayload,
} from "@zstack/zsphere-types/graphql";
import { filter as _filter, map as _map, xor as _xor } from "lodash-es";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import AddImageModal from "../../image/create";
import AttachAlarmModal from "../action/attach-alarm-modal";
import CephTrashDataClean from "../action/ceph-data-clean";
import DataClear from "../action/clear-modal";
import DeleteModal from "../action/delete-modal";
import SettingsModal from "../action/edit-advance-setting-in-tree";
import EditNameDescModal from "../action/edit-name-desc";
import ModifyConfigModal from "../action/modify-config/index";
import ReconnectModal from "../action/reconnect-modal";
import StopModal from "../action/stop-modal";
import UpdatePasswordModal from "../action/update-password-modal";
import {
  length,
  verifyAddImage,
  verifyBatchClear,
  verifyClear,
  verifyDelete,
  verifyReconnect,
  verifyStart,
  verifyStop,
  verifyUpdatePassword,
} from "../action/validator";
import CreateBackupStorageModal from "../create";

const changeBackupStorageState = gql`
  mutation changeBackupStorageState($input: ChangeBackupStorageStateInput!) {
    changeBackupStorageState(input: $input) {
      actionId
    }
  }
`;

function useActionConfig() {
  const intl = useIntl();
  const doAction = useAction();

  const start = useCallback(
    async (selectedList, setSelectedList) => {
      setSelectedList?.([]);
      const uuids = _map(_filter(selectedList, ["state", "Disabled"]), "uuid");
      const payload: IChangeBackupStorageStatePayload[] = uuids.map((uuid) => {
        return { uuid, stateEvent: IBackupStorageStateEvent.enable };
      });
      doAction({
        mutation: changeBackupStorageState,
        payload,
        name: intl.formatMessage({
          id: "enable.backupStorage",
          defaultMessage: "Enable Image Storage",
        }),
        total: uuids.length,
      });
    },
    [intl, doAction],
  );
  const config = _useActionConfig<IBackupStorage>([
    {
      key: "add.backup.storage",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: CreateBackupStorageModal,
    },
    {
      key: "virtualization.edit.nameandDescription",
      ActionWrapper: EditNameDescModal,
    },
    {
      key: "update.password",
      ActionWrapper: UpdatePasswordModal,
    },
    {
      key: "modify.config",
      ActionWrapper: ModifyConfigModal,
    },
    {
      key: "modify.advance.settings",
      ActionWrapper: (props) => {
        return <SettingsModal {...props} detail={props?.selectedList?.[0]} />;
      },
    },
    {
      key: "enable",
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
      preValidators: [verifyStart],
      onClick: ({ selectedList, setSelectedList }) =>
        start(selectedList, setSelectedList),
    },
    {
      key: "disable",
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
      preValidators: [verifyStop],
      ActionWrapper: StopModal,
    },
    {
      key: "reconnect",
      validators: [verifyReconnect],
      ActionWrapper: ReconnectModal,
    },
    {
      key: "data.clean",
      preValidators: [(selectedList) => verifyBatchClear(selectedList)],
      validators: [verifyClear],
      ActionWrapper: (props) => {
        const type = props?.selectedList?.[0]?.type ?? -1;
        return type === BackupStorageType.ImageStoreBackupStorage ? (
          <DataClear {...props} />
        ) : (
          <CephTrashDataClean
            {...props}
            trashQueryType={ITrashQueryType.BackupStorage}
          />
        );
      },
    },
    {
      key: "add.image",
      validators: [verifyAddImage],
      ActionWrapper: (props) => {
        const { selectedList, setVisible, visible } = props;
        return (
          <AddImageModal
            selectedList={selectedList}
            setVisible={setVisible}
            visible={visible}
            from="backupStorage"
          />
        );
      },
    },
    {
      key: "update.password",
      validators: [verifyUpdatePassword],
      ActionWrapper: UpdatePasswordModal,
    },
    {
      key: "delete",
      validators: [verifyDelete],
      ActionWrapper: DeleteModal,
    },
    {
      key: "attach.alarm",
      autoInjectPreValidator: false,
      ActionWrapper: AttachAlarmModal,
    },
    {
      key: "detach.alarm",
      preValidators: [length],
      onClick: ({ source, selectedList, setSelectedList }) => {
        const { labels } = source;
        const { key } = labels?.[0] ?? {};
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
  ]);
  return { ...config, gql: backupStorageList };
}
export default useActionConfig;
