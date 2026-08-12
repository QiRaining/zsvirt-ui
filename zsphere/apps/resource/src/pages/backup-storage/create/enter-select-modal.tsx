import type { SelectWayEntry } from "@zstack/zsphere-design-biz";
import { DialogSelectWay } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { BackupStorageType } from "@zstack/zsphere-types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import CreateBackupStorage from "./create";

const EMPTY_LIST: never[] = [];

interface IProps {
  onCancel: () => void;
}

const EnterSelect: React.FC<IActionWrapperProps<any> & IProps> = ({
  visible,
  setVisible,
  selectedList,
  source,
  onCancel,
}) => {
  const intl = useIntl();
  const [createWay, setCreateWay] = useState<BackupStorageType>(
    BackupStorageType.ImageStoreBackupStorage,
  );
  const [createBackupStorageVisible, setCreateBackupStorageVisible] =
    useState(false);

  useEffect(() => {
    if (!visible && !createBackupStorageVisible) {
      setCreateWay(BackupStorageType.ImageStoreBackupStorage);
    }
  }, [createBackupStorageVisible, visible]);

  const entries: SelectWayEntry[] = useMemo(
    () => [
      {
        icon: "server",
        title: intl.formatMessage({
          id: "backupStorage.type.imageStore",
          defaultMessage: "Standalone Image Storage",
        }),
        value: BackupStorageType.ImageStoreBackupStorage,
        description: intl.formatMessage({
          id: "backupStorage.type.imageStore.tip",
          defaultMessage: "Store image files through image slices and support incremental storage.",
        }),
      },
      {
        icon: "server-2",
        title: intl.formatMessage({
          id: "backupStorage.type.ceph",
          defaultMessage: "Distributed Image Storage",
        }),
        value: BackupStorageType.Ceph,
        description: intl.formatMessage({
          id: "backupStorage.type.ceph.tip",
          defaultMessage: "Store image files through distributed block storage.",
        }),
      },
    ],
    [intl],
  );

  const onConfirm = useCallback(() => {
    setCreateBackupStorageVisible(true);
    setVisible(false);
  }, [setVisible]);

  return (
    <>
      <DialogSelectWay
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage({
          id: "create.backup.storage.way.select.modal.title",
          defaultMessage: "Select Image Storage Type",
        })}
        entries={entries}
        value={createWay}
        onChange={setCreateWay}
        tip={intl.formatMessage({
          id: "backup.storage.modal.title.create.way.tip",
          defaultMessage: "Choose a type to add an image storage.",
        })}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />

      <CreateBackupStorage
        visible={createBackupStorageVisible}
        setVisible={setCreateBackupStorageVisible}
        view=""
        source={{
          createWay,
          zone:
            selectedList?.[0]?.__typename === "BackupStorage"
              ? selectedList?.[0]?.zone
              : selectedList?.[0]?.__typename === "Zone"
                ? selectedList?.[0]
                : source,
        }}
        selectedList={EMPTY_LIST}
        position="row"
        onCancel={onCancel}
      />
    </>
  );
};

export default EnterSelect;
