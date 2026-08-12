import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import BackupStorageList from "../../../disaster-recovery-storage/list";

const syncDatabaseBackupToLocal = gql`
  mutation syncDatabaseBackupToLocal($input: SyncDatabaseBackupToLocalInput!) {
    syncDatabaseBackupToLocal(input: $input) {
      actionId
    }
  }
`;

const SyncDatabaseBackupToLocal: React.FC<IActionWrapperProps<unknown>> = ({
  visible,
  setVisible,
  refetch,
  setSelectedList,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = (values: any) => {
    const payload = values?.map((cv: any) => ({
      uuid: selectedList[0].uuid,
      srcBackupStorageUuid: selectedList?.[0]?.remoteBackupStorage?.uuid,
      dstBackupStorageUuid: cv.uuid,
    }));

    doAction({
      mutation: syncDatabaseBackupToLocal,
      payload,
      name: intl.formatMessage({
        id: "sync.to.local.backup.storage",
        defaultMessage: "Sync to Local Backup Storage",
      }),
      total: 1,
      type: "Zone",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const localStorageDefaultQuery = React.useMemo(() => {
    const conditions: IQuery["conditions"] = [
      {
        key: "state",
        op: Op.eq,
        value: "Enabled",
      },
      {
        key: "status",
        op: Op.eq,
        value: "Connected",
      },
      {
        key: "type",
        op: Op.eq,
        value: "ImageStoreBackupStorage",
      },
      {
        key: "__systemTag__",
        op: Op.in,
        values: ["onlybackup", "allowbackup"],
      },
    ];
    return {
      conditions,
    };
  }, []);

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "sync.to.local.backup.storage",
        defaultMessage: "Sync to Local Backup Storage",
      })}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
      selectType="radio"
      resourceName={
        selectedList.length > 1
          ? intl.formatMessage(
              { id: "object.count", defaultMessage: "{num} objects" },
              { num: selectedList.length },
            )
          : selectedList[0]?.name
      }
    >
      <BackupStorageList
        view="select"
        defaultQuery={localStorageDefaultQuery}
      />
    </ModalSelect>
  );
};

export default SyncDatabaseBackupToLocal;
