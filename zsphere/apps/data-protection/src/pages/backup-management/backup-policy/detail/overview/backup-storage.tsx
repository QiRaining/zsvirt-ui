import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, ResourceName, DraggableCard } from "@zstack/zsphere-components";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { Space } from "antd";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps extends IDraggableCardProps {
  current?: SchedulerJobGroup;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "local.back.up.storage",
          defaultMessage: "Local Backup Storage",
        }),
        value: current?.localBackupStorage?.length && (
          <Space split={<span>，</span>}>
            {current.localBackupStorage.map((item) => (
              <ResourceName
                key={item.uuid}
                value={item.name}
                link={{
                  to: "/backup-management/disaster-recovery-storage",
                  microAppName: "virtualization-data-protection",
                  uuid: item.uuid,
                }}
              />
            ))}
          </Space>
        ),
      },
      {
        label: intl.formatMessage({
          id: "sync.to.remote.backup.storage",
          defaultMessage: "Sync to Remote Backup Storage",
        }),
        value: current?.remoteBackupStorage
          ? intl.formatMessage({
              id: "backup.sync.to.remote.enabled",
              defaultMessage: "Enabled",
            })
          : intl.formatMessage({
              id: "backup.sync.to.remote.disabled",
              defaultMessage: "Disabled",
            }),
      },
      {
        label: intl.formatMessage({
          id: "remote.back.up.storage",
          defaultMessage: "Remote Backup Storage",
        }),
        value: current?.remoteBackupStorage && (
          <ResourceName
            value={current.remoteBackupStorage.name}
            link={{
              to: "/backup-management/disaster-recovery-storage",
              microAppName: "virtualization-data-protection",
              uuid: current.remoteBackupStorage.uuid,
            }}
          />
        ),
      },
    ],
    [current, intl],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "back.up.storage",
        defaultMessage: "Backup Storage",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
