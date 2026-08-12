import { gql } from "@apollo/client";
import { useTime } from "@zstack/hooks";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { SchedHistoryLog } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { merge } from "lodash-es";
import React, { useMemo, useState } from "react";
import Toolbar from "zsv_shared/migration-activity/toolbar";

import { useColumnConfig, useQueryConfig } from "./config";
import LogDetail from "./log-detail";

const GET_SCHED_HISTORY_LOG = gql`
  query schedLogList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    schedHistoryLogList(
      conditions: $conditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        success
        accountUuid
        destHostUuid
        vmInstanceUuid
        lastHostUuid
        owner {
          uuid
          name
          type
        }
        createDate
        lastOpDate
        schedType
        failReason
        schedReason
        destHost {
          name
          uuid
        }
        preHost {
          name
          uuid
        }
        vmInstance {
          name
          uuid
          type
        }
        slbUuid
      }
    }
  }
`;

const HaLog: React.FC<IListProps<SchedHistoryLog>> = (props) => {
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [logData, setLogData] = useState<any>({});
  const { postClientTime } = useTime();
  const defaultQuery: IQuery = useMemo(() => {
    const baseCondition = [
      {
        key: "createDate",
        op: Op.gte,
        value: postClientTime()
          .subtract(7, "days")
          .format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        key: "createDate",
        op: Op.lte,
        value: postClientTime().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        key: "schedType",
        op: Op.eq,
        value: "VMHA",
      },
    ];
    return {
      conditions: baseCondition,
    };
  }, [postClientTime]);

  const [query, setQuery] = useState<IQuery>(() =>
    merge({}, defaultQuery, { start: 0, limit: 10 }),
  );
  const queryConfig = useQueryConfig(query);
  const columnConfig = useColumnConfig({
    setLogData,
    setVisible: setDetailVisible,
  });

  const refetchAll = (newQuery?: IQuery) => {
    setQuery(merge({}, newQuery, { type: genUuid() }));
  };

  return (
    <>
      <TableList
        rowKey="id"
        type="SchedHistoryLog"
        rowSelection={false}
        defaultQuery={query}
        renderMiddleToolbar={() => (
          <Toolbar
            defaultQueryDaysNum={7}
            refetchAll={refetchAll}
            query={query}
            setQuery={setQuery}
            fromSchedHistory
          />
        )}
        toolbar={["search", "export"]}
        resource="schedule.log"
        gql={GET_SCHED_HISTORY_LOG}
        columnConfig={columnConfig}
        queryConfig={queryConfig}
        {...props}
      />
      <LogDetail
        visible={detailVisible}
        setVisible={setDetailVisible}
        logData={logData}
      />
    </>
  );
};

export default HaLog;
