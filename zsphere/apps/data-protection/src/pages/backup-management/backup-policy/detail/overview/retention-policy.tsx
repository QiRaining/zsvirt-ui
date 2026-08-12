import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import type { IntlShape } from "react-intl";

export interface IProps extends IDraggableCardProps {
  current?: SchedulerJobGroup;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const [localPolicy, remotePolicy] = useMemo(() => {
    const jobData = JSON.parse(current?.jobData || "{}");
    const local = jobData.retentionPolicy;
    const remote = jobData.remoteRetentionPolicy;
    return [local, remote];
  }, [current]);

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "local.retention.policy",
          defaultMessage: "Local Retention Policy",
        }),
        value: current?.jobType && (
          <span style={{ whiteSpace: "normal" }}>
            {formatRetentionPolicy(intl, current.jobType, localPolicy)}
          </span>
        ),
      },
      {
        label: intl.formatMessage({
          id: "offsite.retention.policy",
          defaultMessage: "Remote Retention Policy",
        }),
        value: current?.jobType && (
          <span style={{ whiteSpace: "normal" }}>
            {formatRetentionPolicy(intl, current.jobType, remotePolicy)}
          </span>
        ),
      },
    ],
    [current, intl, localPolicy, remotePolicy],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "retention.policy",
        defaultMessage: "Retention Policy",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

function formatRetentionPolicy(
  intl: IntlShape,
  jobType: string,
  value?: {
    retentionType: string;
    retentionValue: number;
    fullBackupRetentionValue?: number;
  },
) {
  if (!value) {
    return intl.formatMessage({
      id: "keep.forever",
      defaultMessage: "Keep forever",
    });
  }
  const { retentionType, retentionValue, fullBackupRetentionValue } = value;
  if (retentionType === "Days") {
    return intl.formatMessage(
      {
        id: "retention.policy.detail.byTime",
        defaultMessage: "Retain only the latest {num} backup data",
      },
      { num: formatDays(intl, retentionValue) },
    );
  }
  if (jobType === "vmBackup") {
    return intl.formatMessage(
      {
        id: "retention.policy.detail.vm.byCount",
        defaultMessage:
          "Retain only the latest {num1} incremental backup data and {num2} full backup data.",
      },
      { num1: retentionValue, num2: fullBackupRetentionValue ?? 1 },
    );
  }
  return intl.formatMessage(
    {
      id: "retention.policy.detail.db.byCount",
      defaultMessage: "Retain only the latest {num1} backup data.",
    },
    { num1: retentionValue },
  );
}

function formatDays(intl: IntlShape, value: number) {
  if (value % 30 === 0) {
    return `${value / 30} ${intl.formatMessage({
      id: "month",
      defaultMessage: "months",
    })}`;
  }
  if (value % 7 === 0) {
    return `${value / 7} ${intl.formatMessage({
      id: "week",
      defaultMessage: "weeks",
    })}`;
  }
  return `${value} ${intl.formatMessage({ id: "day", defaultMessage: "days" })}`;
}
