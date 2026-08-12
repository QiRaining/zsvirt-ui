import { ResourceName } from "@zstack/zsphere-components";
import { SchedulerJobState } from "@zstack/zsphere-types";
import type { SnapshotStrategy } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import { useIntl } from "react-intl";

import { useColumnConfig } from "../../../../../../shared/engine/src/snapshot-strategy";
import {
  formatCronDescription,
  parseCron,
  getNextExecutionTime,
} from "../util";

export default () => {
  const intl = useIntl();
  return useColumnConfig<SnapshotStrategy>([
    {
      key: "name",
      render: (current: SnapshotStrategy) => {
        return (
          <ResourceName
            value={current.name}
            link={{
              to: `/snapshot/strategy`,
              microAppName: "virtualization-data-protection",
              uuid: current.uuid,
            }}
          />
        );
      },
    },
    {
      key: "state",
      filterOptions: SchedulerJobState,
    },
    {
      key: "period",
      formatter: (current: SnapshotStrategy) => {
        const trigger = current.triggers?.[0];
        if (!trigger) {
          return;
        }
        const cronParam = parseCron(trigger.cron);
        return formatCronDescription(intl, cronParam);
      },
    },
    {
      key: "snapshotCount",
      formatter: (current: SnapshotStrategy) => {
        const jobData = JSON.parse(current.jobData || "{}");
        return jobData.snapshotGroupMaxNumber;
      },
    },
    {
      key: "vmCount",
      formatter: (current: SnapshotStrategy) => current.jobs?.length ?? 0,
    },
    {
      key: "nextExecuteTime",
      formatter: (current: SnapshotStrategy) => {
        const trigger = current.triggers?.[0];
        if (!trigger) {
          return;
        }
        const cronParam = parseCron(trigger.cron);
        const nextExecuteTime = getNextExecutionTime({
          ...cronParam,
          currentTime: dayjs(),
          startTime: dayjs(new Date(trigger.startTime)),
          endTime: trigger.stopTime
            ? dayjs(new Date(trigger.stopTime))
            : undefined,
        });
        return nextExecuteTime?.format("YYYY-MM-DD HH:mm");
      },
    },
    {
      key: "owner",
      render: (current: SnapshotStrategy) => {
        return current.owner.uuid === "36c27e8ff05c4780bf6d2fa65700f22e" ? (
          current.owner.name
        ) : (
          <ResourceName
            value={current.owner.name}
            link={{
              to: "/account-information",
              microAppName: "virtualization-administration",
              uuid: current.owner.uuid,
            }}
          />
        );
      },
    },
    {
      key: "startTime",
      formatter: ({ triggers }) => {
        const startTime = triggers?.[0]?.startTime;
        return startTime
          ? dayjs(new Date(startTime)).format("YYYY-MM-DD HH:mm")
          : undefined;
      },
    },
    {
      key: "endTime",
      formatter: (current: SnapshotStrategy) => {
        const trigger = current.triggers?.[0];
        if (!trigger) {
          return;
        }
        if (trigger.stopTime) {
          return dayjs(new Date(trigger.stopTime)).format("YYYY-MM-DD HH:mm");
        }
        return intl.formatMessage({ id: "never", defaultMessage: "Never" });
      },
    },
  ]);
};
