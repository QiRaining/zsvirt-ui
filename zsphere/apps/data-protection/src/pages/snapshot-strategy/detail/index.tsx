import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Tabs, TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { SnapshotStrategyList as ISnapshotStrategyList } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import AttachedVm from "./attached-vm";
import DetailAudit from "./audit";
import ExecutionLog from "./execution-log";
import DetailHeader from "./header";
import Overview from "./overview";

interface IQueryResp {
  snapshotStrategyList?: ISnapshotStrategyList;
}

const snapshotStrategyList = gql`
  query snapshotStrategyList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    snapshotStrategyList(
      start: $start
      limit: $limit
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        state
        jobsUuid
        jobs {
          uuid
          name
          jobData
          targetResourceUuid
          schedulerJobGroupUuids
          lastOpDate
          createDate
        }
        jobData
        triggersUuid
        triggers {
          uuid
          name
          cron
          startTime
          stopTime
          lastOpDate
          createDate
        }
        owner {
          uuid
          name
          type
        }
        lastOpDate
        createDate
      }
    }
  }
`;

export default function Detail() {
  const intl = useIntl();
  const location = useLocation();
  const uuid = new URLSearchParams(location.search).get("uuid");

  const { loading, data, refetch } = useQuery<IQueryResp>(
    snapshotStrategyList,
    {
      variables: { conditions: [{ key: "uuid", value: uuid, op: Op.eq }] },
    },
  );
  const current = data?.snapshotStrategyList?.list?.[0];

  return (
    <AutoSkeleton name="snapshot-strategy-detail" loading={loading}>
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
              <TabPane
                key="vm"
                tab={intl.formatMessage({
                  id: "associated.vm",
                  defaultMessage: "Associated VM",
                })}
              >
                <AttachedVm current={current} />
              </TabPane>
              <TabPane
                key="executionLog"
                tab={intl.formatMessage({
                  id: "snapshot.strategy.execution.log",
                  defaultMessage: "Execution Record",
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
