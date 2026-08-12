import { gql } from "@apollo/client";
import BackupStorageList from "@zstack/virtualization-resource/src/pages/backup-storage/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  Image as IImage,
  SyncImageFromImageStoreBackupStoragePayload as ISyncImageFromImageStoreBackupStoragePayload,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const SyncImageModal: React.FC<IActionWrapperProps<IImage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const defaultQueryBackupStorageList = useMemo(() => {
    return {
      conditions: [
        {
          key: "uuid",
          op: Op.notIn,
          values: selectedList?.map(
            (image) => image?.backupStorage?.uuid ?? -1,
          ),
        },
        {
          key: "type",
          op: Op.eq,
          value: "ImageStoreBackupStorage",
        },
        {
          key: "__systemTag__",
          op: Op.notIn,
          values: ["remote", "onlybackup", "aliyun", "remotebackup"],
        },
        {
          key: "status",
          op: Op.ne,
          value: "Disconnected",
        },
        {
          key: "state",
          op: Op.ne,
          value: "Disabled",
        },
      ],
    };
  }, [selectedList]);

  const syncImage = gql`
    mutation syncImageFromImageStoreBackupStorage(
      $input: SyncImageFromImageStoreBackupStorageInput!
    ) {
      syncImageFromImageStoreBackupStorage(input: $input) {
        actionId
      }
    }
  `;
  const doAction = useAction();

  const onOk = (value: IBackupStorage[]) => {
    const payload: ISyncImageFromImageStoreBackupStoragePayload[] =
      selectedList?.map((image) => {
        return {
          uuid: image?.uuid,
          srcBackupStorageUuid:
            image?.backupStorageRefs?.[0].backupStorageUuid ?? -1,
          dstBackupStorageUuid: value?.[0]?.uuid,
          name: image?.name,
        };
      });
    doAction({
      mutation: syncImage,
      payload,
      name: intl.formatMessage({
        id: "sync.image",
        defaultMessage: "Synchronize Image",
      }),
      total: selectedList?.length,
      onFinish: () => {
        setVisible(false);
        setSelectedList?.([]);
      },
    });
  };

  return (
    <ModalSelect
      alertType="info"
      alertMessage={intl.formatMessage({
        id: "image.modal.syncImage.alertMessage",
        defaultMessage: "You can synchronize images between standalone image storage.",
      })}
      title={intl.formatMessage({
        id: "sync.image",
        defaultMessage: "Synchronize Image",
      })}
      visible={visible}
      selectType="radio"
      showSelect={false}
      setVisible={setVisible}
      onOk={onOk}
      className={style["self-modal-select"]}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <BackupStorageList
        view="select"
        defaultQuery={defaultQueryBackupStorageList}
      />
    </ModalSelect>
  );
};

export default SyncImageModal;
