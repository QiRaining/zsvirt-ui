import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { BackupData } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import BackupStorageList from "../../../disaster-recovery-storage/list";

const syncBackupDataToRemote = gql`
  mutation syncBackupToRemote($input: SyncBackupDataToRemoteInput!) {
    syncBackupToRemote(input: $input) {
      actionId
    }
  }
`;

const SyncBackupDataToRemote: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  refetch,
  setSelectedList,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload = selectedList?.map((it: BackupData) => {
      return {
        groupUuid: it.groupUuid ?? "",
        srcBackupStorageUuid: it.localBackupStorage?.uuid ?? "",
        type: "Root",
      };
    });

    doAction({
      mutation: syncBackupDataToRemote,
      payload,
      name: intl.formatMessage({
        id: "sync.to.remote.backup.storage",
        defaultMessage: "Sync to Remote Backup Storage",
      }),
      total: 1,
      type: "BackupData",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const remoteStorageDefaultQuery = React.useMemo(() => {
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
        values: ["remotebackup"],
      },
    ];

    return {
      conditions,
    };
  }, []);

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "sync.to.remote.backup.storage",
        defaultMessage: "Sync to Remote Backup Storage",
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
        defaultQuery={remoteStorageDefaultQuery}
      />
    </ModalSelect>
  );
};

export default SyncBackupDataToRemote;
