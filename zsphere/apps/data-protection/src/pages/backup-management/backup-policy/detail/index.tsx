import { useQuery } from "@apollo/client";
import { Tabs, TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import { schedulerJobGroupList } from "../../../../gql/scheduler-job-group.gql";
import DetailAudit from "./audit";
import AttachedVm from "./backup-resource";
import ExecutionLog from "./execution-log";
import DetailHeader from "./header";
import Overview from "./overview";

export default function Detail() {
  const intl = useIntl();
  const location = useLocation();
  const uuid = new URLSearchParams(location.search).get("uuid");

  const { loading, data, refetch } = useQuery(schedulerJobGroupList, {
    variables: { conditions: [{ key: "uuid", value: uuid, op: Op.eq }] },
  });
  const current = data?.schedulerJobGroupList?.list?.[0];

  return (
    <AutoSkeleton name="backup-policy-detail" loading={loading}>
      <div className="zsv-detail-container">
        {current ? (
          <>
            <DetailHeader current={current} refetch={refetch} />
            <Tabs type="line">
              <TabPane
                key="overview"
                tab={intl.formatMessage({
                  id: "overview",
                  defaultMessage: "Overview",
                })}
              >
                <Overview current={current} />
              </TabPane>
              {current.jobType === "vmBackup" && (
                <TabPane
                  key="vm"
                  tab={intl.formatMessage({
                    id: "backup.resource",
                    defaultMessage: "Backup Resources",
                  })}
                >
                  <AttachedVm current={current} />
                </TabPane>
              )}
              <TabPane
                key="executionLog"
                tab={intl.formatMessage({
                  id: "backup.operation",
                  defaultMessage: "Backup Job",
                })}
              >
                <ExecutionLog current={current} />
              </TabPane>
              <TabPane
                tab={intl.formatMessage({
                  id: "audit",
                  defaultMessage: "Event",
                })}
                key="audit"
              >
                <DetailAudit current={current} />
              </TabPane>
            </Tabs>
          </>
        ) : null}
      </div>
    </AutoSkeleton>
  );
}
