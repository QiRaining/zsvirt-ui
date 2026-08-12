import { gql, useQuery } from "@apollo/client";
import { Drawer, DrawerHeader, DrawerBody } from "@zstack/design";
import { Op } from "@zstack/zsphere-types";
import type {
  SchedulerJobHistory,
  SchedulerJobHistoryGroupByFireInstanceId,
} from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import { useState } from "react";
import { useIntl } from "react-intl";

import ApiDetail from "./api-detail";
import BasicInfo from "./basic-info";
import JobDetail from "./job-detail";

import style from "./style.module.less";

export interface IProps {
  current?: SchedulerJobHistoryGroupByFireInstanceId;
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const schedulerJobHistoryGroupByFireInstanceIdList = gql`
  query schedulerJobHistoryGroupByFireInstanceIdList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $limit: Int
    $start: Int
    $groupBy: String
  ) {
    schedulerJobHistoryGroupByFireInstanceIdList(
      conditions: $conditions
      extraConditions: $extraConditions
      limit: $limit
      start: $start
      sortBy: $sortBy
      sortDirection: $sortDirection
      groupBy: $groupBy
      replyWithCount: true
    ) {
      total
      list {
        executeTime
        fireInstanceId
        id
        jobType
        requestDump
        resultDump
        schedulerJobUuid
        startExecutionTime
        startTime
        endTime
        success
        targetResourceUuid
        triggerUuid
        backupCapacityForSchedulerJobHistoryGroup
        vmInstance {
          name
          uuid
        }
        volume {
          name
          uuid
          type
        }
        resourceCount
        mode
        schedulerName
        successCount
        failCount
        runningCount
      }
    }
  }
`;

export default function Detail({ current, visible, setVisible }: IProps) {
  const intl = useIntl();
  return (
    <Drawer
      open={visible}
      setOpen={(v) => {
        if (typeof v === "function") {
          setVisible(v(visible));
        } else {
          setVisible(v);
        }
      }}
      className={style.drawer}
      style={{ width: 600 }}
    >
      <DrawerHeader onClose={() => setVisible(false)}>
        {intl.formatMessage({
          id: "scheduler.job.history.detail",
          defaultMessage: "Job Details",
        })}
      </DrawerHeader>
      <DrawerBody>
        <Content current={current} />
      </DrawerBody>
    </Drawer>
  );
}

export interface IContentProps {
  current?: SchedulerJobHistoryGroupByFireInstanceId;
}

interface IApiDetailState {
  value?: SchedulerJobHistory;
  visible: boolean;
}

interface IQueryResp {
  schedulerJobHistoryGroupByFireInstanceIdList?: {
    list?: SchedulerJobHistoryGroupByFireInstanceId[];
  };
}

function Content(props: IContentProps) {
  const [apiDetail, setApiDetail] = useState<IApiDetailState>({
    visible: false,
  });
  const { data } = useQuery<IQueryResp>(
    schedulerJobHistoryGroupByFireInstanceIdList,
    {
      variables: {
        conditions: [
          {
            key: "fireInstanceId",
            op: Op.eq,
            value: props.current?.fireInstanceId ?? "",
          },
        ],
      },
    },
  );
  const current =
    data?.schedulerJobHistoryGroupByFireInstanceIdList?.list?.[0] ??
    props.current;
  return (
    <div className={style.content}>
      <div className={style.infoWrapper}>
        <BasicInfo current={current} />
        <JobDetail
          source={current}
          onShowApi={(value) => setApiDetail({ value, visible: true })}
        />
      </div>
      <div
        className={cls(style.apiDetailWrapper, {
          [style.show]: apiDetail.visible,
        })}
      >
        <ApiDetail
          current={apiDetail.value}
          onClose={() => setApiDetail({ ...apiDetail, visible: false })}
        />
      </div>
    </div>
  );
}
