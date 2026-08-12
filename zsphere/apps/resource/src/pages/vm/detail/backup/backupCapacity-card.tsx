import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { StorageProgress } from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import styles from "./style.module.less";

const STYLE_MARGIN_LEFT_8PX = { marginLeft: "8px" } as const;

interface IProps {
  localSizeData: any;
  remoteSizeData: any;
}

const BackupCapacityCard: React.FC<IProps> = ({
  localSizeData,
  remoteSizeData,
}) => {
  const intl = useIntl();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "local.backup.capacity",
          defaultMessage: "Local Backup Size",
        }),
        value: localSizeData?.storageProgressData?.length ? (
          <div className={styles.storageProgressBox}>
            <StorageProgress
              width={160}
              height={8}
              dataSource={localSizeData.storageProgressData}
            />
            <span style={STYLE_MARGIN_LEFT_8PX}>
              {localSizeData.storageTotalCapacity}
            </span>
          </div>
        ) : (
          <span className={styles["text-neutral-500"]}>
            {intl.formatMessage({ id: "no.data", defaultMessage: "No Data" })}
          </span>
        ),
      },
      {
        label: intl.formatMessage({
          id: "remote.backup.capacity",
          defaultMessage: "Remote Backup Size",
        }),
        value: remoteSizeData?.storageProgressData?.length ? (
          <div className={styles.storageProgressBox}>
            <StorageProgress
              width={160}
              height={8}
              dataSource={remoteSizeData.storageProgressData}
            />
            <span style={STYLE_MARGIN_LEFT_8PX}>
              {remoteSizeData.storageTotalCapacity}
            </span>
          </div>
        ) : (
          <span className={styles["text-neutral-500"]}>
            {intl.formatMessage({ id: "no.data", defaultMessage: "No Data" })}
          </span>
        ),
      },
    ],
    [intl, localSizeData, remoteSizeData],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "backup.capacity.card.title",
        defaultMessage: "Backup Size",
      })}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BackupCapacityCard;
