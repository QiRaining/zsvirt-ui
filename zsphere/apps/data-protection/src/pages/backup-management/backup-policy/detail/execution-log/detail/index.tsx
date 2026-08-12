import { useQuery } from "@apollo/client";
import { Drawer, DrawerHeader, DrawerBody } from "@zstack/design";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  SchedulerJobHistoryGroupByFireInstanceId,
  SchedulerJobGroup,
} from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { schedulerJobHistoryGroupByFireInstanceIdList } from "../../../../../../gql/scheduled-job-history.gql";
import BasicInfo from "./basic-info";
import JobDetail from "./job-detail";

import style from "./style.module.less";

export default function Detail({
  selectedList,
  visible,
  setVisible,
  source,
}: IActionWrapperProps<SchedulerJobHistoryGroupByFireInstanceId>) {
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
          id: "backup.task.detail",
          defaultMessage: "Backup Job Details",
        })}
      </DrawerHeader>
      <DrawerBody>
        <Content current={selectedList[0]} source={source as any} />
      </DrawerBody>
    </Drawer>
  );
}

export interface IContentProps {
  current?: SchedulerJobHistoryGroupByFireInstanceId;
  source?: SchedulerJobGroup;
}

function Content(props: IContentProps) {
  const { data } = useQuery(schedulerJobHistoryGroupByFireInstanceIdList, {
    variables: {
      conditions: [
        {
          key: "fireInstanceId",
          op: Op.eq,
          value: props.current?.fireInstanceId ?? "",
        },
      ],
    },
  });
  const current =
    data?.schedulerJobHistoryGroupByFireInstanceIdList?.list?.[0] ??
    props.current;
  return (
    <div className={style.content}>
      <BasicInfo current={current} source={props.source} />
      <JobDetail source={current} />
    </div>
  );
}
