import { useActionConfig } from "@zstack/zsphere-engine/src/scheduler-job-history";
import type { SchedulerJobHistory as ISchedulerJobHistory } from "@zstack/zsphere-types/graphql";

import SchedulerJobHistoryFireInstanceIdDetailModel from "../action/scheduler-job-history-fireInstanceId-detail-model";

export default () => {
  return useActionConfig<ISchedulerJobHistory>([
    {
      key: "backup.job.history.detail",
      ActionWrapper: SchedulerJobHistoryFireInstanceIdDetailModel,
    },
    {
      key: "database.backup.history.detail",
      ActionWrapper: SchedulerJobHistoryFireInstanceIdDetailModel,
    },
  ]);
};
