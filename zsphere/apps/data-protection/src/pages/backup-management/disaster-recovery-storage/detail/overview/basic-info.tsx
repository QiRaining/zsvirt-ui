import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import { getBackupStorageType } from "zsv_data_protection_shared/backup-management/disaster-recovery-storage/mf-index";

export interface IProps {
  detail: IZSVBackupStorage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();

  const { getServerTime } = useTime();

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "enable.state",
          defaultMessage: "State",
        }),
        value: <Constant value={detail?.state as any} />,
      },
      {
        label: intl.formatMessage({
          id: "readyStatus",
          defaultMessage: "Status",
        }),
        value: <Constant value={detail?.status as any} />,
      },
      {
        label: intl.formatMessage({
          id: "storage.type",
          defaultMessage: "Storage Type",
        }),
        value: getBackupStorageType(detail?.backupStorageType as any, intl),
      },
      {
        label: intl.formatMessage({
          id: "total.capacity",
          defaultMessage: "Total Capacity",
        }),
        value: formatStorage(detail.totalCapacity, 2) || 0,
      },
      {
        label: intl.formatMessage({
          id: "availableCapacity",
          defaultMessage: "Physical Available",
        }),
        value: formatStorage(detail.availableCapacity, 2) || 0,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: detail.description,
        canModify: true,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{detail.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [intl, detail],
  );

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
