import { Button } from "@zstack/design";
import { DialogBase, DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ZSVBackupStorage as IZSVBackupStorage,
  ScanDataZSVBackupStoragePayload as IScanDataZSVBackupStoragePayload,
} from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { scanDataZSVBackupStorage } from "../../../../gql/disaster-recovery-storage.gql";

import styles from "./style.module.less";

const ScanDataAction: React.FC<IActionWrapperProps<IZSVBackupStorage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const [resultModalVisible, SetResultModalVisible] = useState(false);

  const [resultCountData, SetResultCountData] = useState(
    [0, 0].map((t) => {
      return { total: t };
    }),
  );

  const onOk = async () => {
    setSelectedList?.([]);
    const payload: IScanDataZSVBackupStoragePayload[] = selectedList.map(
      (item) => {
        return {
          uuid: item.uuid,
          currentZoneUuid: source?.selectedZone.uuid,
          backupStorageType: item.backupStorageType,
        };
      },
    );
    doAction({
      mutation: scanDataZSVBackupStorage,
      payload,
      name: intl.formatMessage({
        id: "scan.backup.data",
        defaultMessage: "Scan Backup Data",
      }),
      total: 1,
      type: "ZSVBackupStorage",
      onFinish: (result: IActionResult) => {
        if (result.success === 1) {
          const resultData = result?.inventory?.results;
          SetResultCountData(resultData);
          SetResultModalVisible(true);
        }
      },
    });
  };

  return (
    <>
      <DialogP3
        title={intl.formatMessage({
          id: "modal.title.confirm.scan.backupData",
          defaultMessage: "Scan Backup Data?",
        })}
        resourceNames={(selectedList || []).map((r) => r.name)}
        visible={visible}
        setVisible={setVisible}
        onConfirm={onOk}
      />
      <ScanResultModal
        value={resultCountData}
        resourceName={selectedList[0]?.name}
        visible={resultModalVisible}
        setVisible={SetResultModalVisible}
      />
    </>
  );
};

export interface IScanResultModalProps {
  value?: any;
  resourceName?: string;
  visible: boolean;
  setVisible: (value: boolean) => void;
}

export function ScanResultModal({
  value,
  resourceName: _resourceName,
  visible,
  setVisible,
}: IScanResultModalProps) {
  const intl = useIntl();

  return (
    <>
      <DialogBase
        title={intl.formatMessage({
          id: "scan.backup.data",
          defaultMessage: "Scan Backup Data",
        })}
        visible={visible}
        setVisible={setVisible}
        footer={
          <Button variant="primary" onClick={() => setVisible(false)}>
            {intl.formatMessage({
              id: "determine",
              defaultMessage: "OK",
            })}
          </Button>
        }
      >
        <div className={styles.resultContent}>
          <div className={styles.resultTitle}>
            {intl.formatMessage({
              id: "scan.backup.data.success.title",
              defaultMessage: "Scan backup data succeeded. Following backup data has been located.",
            })}
          </div>
          <div className={styles.resultTable}>
            <div className={styles.titleRow}>
              <div>
                {intl.formatMessage({
                  id: "backup.data.type",
                  defaultMessage: "Backup Data Type",
                })}
                <span className={styles["end-line"]} />
              </div>
              <div>
                {intl.formatMessage({
                  id: "num.count",
                  defaultMessage: "Quantity",
                })}
              </div>
            </div>
            <div>
              <div>
                {intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
              </div>
              <div>
                {intl.formatMessage(
                  { id: "backup.vm.count", defaultMessage: "{vmCount}" },
                  { vmCount: value?.[0]?.total },
                )}
              </div>
            </div>
            <div>
              <div>
                {intl.formatMessage({
                  id: "platform.database",
                  defaultMessage: "Platform Database",
                })}
              </div>
              <div>
                {intl.formatMessage(
                  {
                    id: "backup.database.count",
                    defaultMessage: "{databaseCount}",
                  },
                  { databaseCount: value?.[1]?.total },
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogBase>
    </>
  );
}

export default ScanDataAction;
