import { Header } from "@zstack/zsphere-components";
import { Op, SchedulerJobGroupType } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import BackupPolicyList from "./list";

export default function BackupPolicy() {
  const intl = useIntl();

  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "jobType",
          op: Op.in,
          values: [
            SchedulerJobGroupType.databaseBackup,
            SchedulerJobGroupType.vmBackup,
          ],
        },
      ],
    }),
    [],
  );

  return (
    <div className="main-list-header-tabs-container">
      <Header.List
        className="main-list-header"
        title={intl.formatMessage({
          id: "backup.policy",
          defaultMessage: "Backup Plan",
        })}
      />
      <div className="zsv-list-padding">
        <BackupPolicyList view="main" defaultQuery={defaultQuery} />
      </div>
    </div>
  );
}
