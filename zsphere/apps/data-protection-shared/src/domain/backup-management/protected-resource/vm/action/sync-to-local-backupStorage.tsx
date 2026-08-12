import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op, BackupResourceType } from "@zstack/zsphere-types";
import type { BackupData as IBackupData } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import BackupStorageList from "../../../disaster-recovery-storage/list";

const syncBackupDataToLocal = gql`
  mutation syncBackupDataToLocal($input: SyncBackupDataToLocalInput!) {
    syncBackupDataToLocal(input: $input) {
      actionId
    }
  }
`;

const SyncBackupDataToLocal: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  refetch,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = (values: any) => {
    const payload = selectedList?.map((it: IBackupData) => {
      return {
        groupUuid: it.groupUuid ?? "",
        srcBackupStorageUuid: values[0]?.uuid ?? "",
        type: "Root",
        backupType: BackupResourceType.VmInstance,
      };
    });

    doAction({
      mutation: syncBackupDataToLocal,
      payload,
      name: intl.formatMessage({
        id: "sync.to.local.backup.storage",
        defaultMessage: "Sync to Local Backup Storage",
      }),
      total: 1,
      type: "BackupData",
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

export default SyncBackupDataToLocal;
