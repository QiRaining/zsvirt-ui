import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import {
  List,
  Constant,
  ResourceName,
  DraggableCard,
} from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import { SchedulerJobGroupType } from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { renderLastJobResult } from "zsv_data_protection_shared/backup-management/backup-policy/mf-index";

export interface IProps extends IDraggableCardProps {
  current?: SchedulerJobGroup;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "enableStatus",
          defaultMessage: "State",
        }),
        value: current?.state && (
          <Constant value={ConstantEnum[current.state]} />
        ),
      },
      {
        label: intl.formatMessage({
          id: "last.backup.job.result",
          defaultMessage: "Last Backup Result",
        }),
        value: current && renderLastJobResult(intl, current),
      },
      {
        label: intl.formatMessage({
          id: "backup.entity.type",
          defaultMessage: "Backup Object Type",
        }),
        value:
          current?.jobType &&
          (current.jobType === SchedulerJobGroupType.vmBackup
            ? intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })
            : intl.formatMessage({
                id: "platform.database",
                defaultMessage: "Platform Database",
              })),
      },
      {
        label: intl.formatMessage({
          id: "backup.resource",
          defaultMessage: "Backup Resources",
        }),
        value: current?.jobs?.length || 0,
      },
      {
        label: intl.formatMessage({ id: "zone", defaultMessage: "Data Center" }),
        show: current?.jobType === SchedulerJobGroupType.vmBackup,
        value: (
          <ResourceName
            value={current?.zone?.name}
            link={{
              to: "/zone",
              microAppName: "virtualization-resource",
              uuid: current?.zone?.uuid,
              leftnav: LeftNavType.ClusterHost,
              navView: NavView.Resource,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
        value:
          current?.owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e" ? (
            current.owner.name
          ) : (
            <ResourceName
              value={current?.owner?.name}
              link={{
                to: "/account-information/user",
                microAppName: "virtualization-administration",
                uuid: current?.owner?.uuid,
              }}
            />
          ),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: current?.description,
        canModify: true,
      },
      {
        label: intl.formatMessage({ id: "UUID", defaultMessage: "UUID" }),
        copyable: true,
        value: current?.uuid,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: dayjs(current?.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [current, intl],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "basicInfo",
        defaultMessage: "Basic Info",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
