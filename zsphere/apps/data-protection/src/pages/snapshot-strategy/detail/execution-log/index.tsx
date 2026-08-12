import type { ITableListProps } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import type {
  SnapshotStrategy,
  SchedulerJobHistoryGroupByFireInstanceId,
} from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import { useState, useMemo } from "react";

import SchedulerJobHistoryList from "../../../scheduler-job-history/group-by-fire-instance-id";
import useColumnConfig from "./config/useColumnConfig";
import Detail from "./detail";
import Toolbar, { initialCondition } from "./toolbar";

export interface IProps {
  current?: SnapshotStrategy;
}

const toolbar: ITableListProps<any>["toolbar"] = ["operation", "refresh"];

export default function ExecutionLog({ current }: IProps) {
  const [timeCondition, setTimeCondition] = useState<any[]>([]);
  const [detail, setDetail] =
    useState<SchedulerJobHistoryGroupByFireInstanceId>();
  const [visible, setVisible] = useState(false);
  const columnConfig = useColumnConfig({ setDetail, setVisible });

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
    <>
      <SchedulerJobHistoryList
        columnConfig={columnConfig}
        rowSelection={false}
        toolbar={toolbar}
        view="sub.virtualization.snapshot-strategy"
        defaultQuery={defaultQuery}
        renderMiddleToolbar={() => <Toolbar setCondition={setTimeCondition} />}
      />
      <Detail current={detail} visible={visible} setVisible={setVisible} />
    </>
  );
}
