import { ResourceName, State } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/backup-job";
import {
  SchedulerJobGroupState,
  SchedulerJobGroupType,
} from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { pick } from "lodash-es";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();
  return useColumnConfig<SchedulerJobGroup>([
    {
      key: "name",
      render: (current) => {
        return (
          <ResourceName
            value={current.name}
            link={{
              to: `/backup-management/backup-policy`,
              microAppName: "virtualization-data-protection",
              uuid: current.uuid,
            }}
          />
        );
      },
    },
    {
      key: "state",
      filterOptions: SchedulerJobGroupState,
    },
    {
      key: "resourceNum",
      formatter: (current) => current.jobs?.length || 0,
    },
    {
      key: "owner",
      render: (current: SchedulerJobGroup) => {
        return current.owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e" ? (
          current.owner.name
        ) : (
          <ResourceName
            value={current.owner?.name}
            link={{
              to: "/account-information/user",
              microAppName: "virtualization-administration",
              uuid: current.owner?.uuid,
            }}
          />
        );
      },
    },
    {
      key: "lastJobResult",
      render: (current: SchedulerJobGroup) =>
        renderLastJobResult(intl, current),
    },
    {
      key: "jobType",
      filterOptions: pick(SchedulerJobGroupType, "vmBackup", "databaseBackup"),
    },
  ]);
};

export function renderLastJobResult(
  intl: IntlShape,
  current: SchedulerJobGroup,
) {
  if (!current.lastJobResult) {
    return (
      <State
        type="queue"
        name={intl.formatMessage({
          id: "backup.pending",
          defaultMessage: "To be backed up",
        })}
      />
    );
  }
  const { runningCount, successCount, failCount } = current.lastJobResult;
  if (runningCount) {
    return (
      <State
        type="progress"
        name={intl.formatMessage({
          id: "backup.running",
          defaultMessage: "Backing up",
        })}
      />
    );
  }
  if (successCount && failCount) {
    return (
      <State
        type="warning"
        name={intl.formatMessage(
          {
            id: "backup.partial.success",
            defaultMessage: "{successCount} succeeded and {failCount} failed",
          },
          {
            successCount,
            failCount,
          },
        )}
      />
    );
  }
  if (failCount) {
    return (
      <State
        type="error"
        name={intl.formatMessage({ id: "fail", defaultMessage: "Failed" })}
      />
    );
  }
  return (
    <State
      type="success"
      name={intl.formatMessage({ id: "success", defaultMessage: "Succeeded" })}
    />
  );
}
