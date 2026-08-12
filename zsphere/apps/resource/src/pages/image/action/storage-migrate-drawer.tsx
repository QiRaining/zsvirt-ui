import { gql } from "@apollo/client";
import List from "@zstack/virtualization-resource/src/pages/backup-storage/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  Op,
  ImageStatus,
  BackupStorageQueryType as IBackupStorageQueryType,
} from "@zstack/zsphere-types";
import type {
  Image as IImage,
  BackupStorage as IBackupStorage,
  BackupStorageMigrateImagePayload as IBackupStorageMigrateImagePayload,
} from "@zstack/zsphere-types/graphql";
import { bus, formatResourceName } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

const storageMigrate = gql`
  mutation backupStorageMigrateImage($input: BackupStorageMigrateImageInput!) {
    backupStorageMigrateImage(input: $input) {
      actionId
    }
  }
`;

const StorageMigrateAction: React.FC<IActionWrapperProps<IImage>> = ({
  visible,
  refetch,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();

  const doAction = useAction();

  const currentImageBSUuid =
    selectedList?.[0]?.backupStorageRefs?.[0].backupStorageUuid || "";
  const onOk = (values: IBackupStorage[]) => {
    const payload: IBackupStorageMigrateImagePayload = {
      imageUuid: selectedList?.[0]?.uuid,
      srcBackupStorageUuid: currentImageBSUuid,
      dstBackupStorageUuid: values?.[0]?.uuid,
    };
    doAction({
      mutation: storageMigrate,
      payload,
      name: intl.formatMessage({
        id: "image.migrate.action.title.change.backupStorage",
        defaultMessage: "Change Image Storage",
      }),
      total: 1,
      type: "Image",
      middleState: {
        type: "Image",
        field: "status",
        data: { status: ImageStatus.Migrating },
        uuids: selectedList.map((item) => item.uuid),
      },
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
        bus.emit("action:refetch:Trash", refetch);
        setSelectedList?.([]);
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "image.migrate.modal.title.change.backupStorage",
        defaultMessage: "Change Image Storage",
      })}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      selectType="radio"
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <List
        view="select"
        defaultQuery={{
          type: IBackupStorageQueryType.MigrateImageCandidate,
          extraConditions: [
            {
              key: "srcBackupStorageUuid",
              op: Op.eq,
              value: currentImageBSUuid,
            },
          ],
        }}
      />
    </ModalSelect>
  );
};

export default StorageMigrateAction;
