import { Op } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import { useState, useMemo } from "react";

import SchedulerJobHistoryList from "../../../../scheduler-job-history/group-by-fire-instance-id";
import useActionConfig from "./config/useActionConfig";
import ExecutionLogDetail from "./detail";
import Toolbar, { initialCondition } from "./toolbar";

import style from "./style.module.less";

export interface IProps {
  current?: SchedulerJobGroup;
}

export default function ExecutionLog({ current }: IProps) {
  const [timeCondition, setTimeCondition] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any[]>([]);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  const actionConfig = useActionConfig(setSelectedList, setDetailVisible);

  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "schedulerJobGroupUuid",
          op: Op.eq,
          value: current?.uuid,
        },
        ...(timeCondition.length
          ? timeCondition
          : [
              {
                key: "startTime",
                op: Op.gte,
                value: dayjs()
                  .add(-initialCondition.duration, "days")
                  .format("YYYY-MM-DD HH:mm:ss"),
              },
            ]),
      ],
    }),
    [current?.uuid, timeCondition],
  );

  return (
    <div className={style.list}>
      <SchedulerJobHistoryList
        rowSelection={false}
        toolbar={["operation", "refresh"]}
        view="sub.scheduler.job.group"
        defaultQuery={defaultQuery}
        source={current}
        actionConfig={actionConfig}
        renderMiddleToolbar={() => <Toolbar setCondition={setTimeCondition} />}
      />
      <ExecutionLogDetail
        visible={detailVisible}
        setVisible={setDetailVisible}
        selectedList={selectedList}
        source={current}
        view=""
        position="row"
      />
    </div>
  );
}
