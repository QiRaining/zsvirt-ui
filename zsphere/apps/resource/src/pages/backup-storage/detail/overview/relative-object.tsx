import { DraggableCard } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { BackupStorageType } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IBackupStorage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const RelativeResource: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const list = useMemo(() => {
    const { zone, poolName, type } = detail;

    return [
      {
        label: intl.formatMessage({ id: "zone", defaultMessage: "Data Center" }),
        value: (
          <ResourceName
            value={zone?.name}
            link={{
              uuid: zone?.uuid,
              to: "/zone",
              microAppName: "virtualization-resource",
            }}
          />
        ),
      },
    ].concat(
      type === BackupStorageType.Ceph
        ? [
            {
              label: intl.formatMessage({
                id: "backupStorage.poolName.uuid",
                defaultMessage: "Pool UUID",
              }),
              value: <CopyableText>{poolName}</CopyableText>,
            },
          ]
        : [],
    );
  }, [detail, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "relative.object",
        defaultMessage: "Related Objects",
      })}
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeResource;
