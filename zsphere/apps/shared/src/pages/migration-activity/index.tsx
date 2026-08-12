import { gql } from "@apollo/client";
import { useTime } from "@zstack/hooks";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { merge } from "lodash-es";
import React, { useMemo, useState } from "react";

import { useColumnConfig, useQueryConfig } from "./config";
import Toolbar from "./toolbar";

const queryDRSVmMigrationActivityList = gql`
  query queryDRSVmMigrationActivityList(
    $start: Int
    $limit: Int
    $conditions: [Condition!]
    $extraConditions: [Condition!]
  ) {
    queryDRSVmMigrationActivityList(
      start: $start
      limit: $limit
      conditions: $conditions
      extraConditions: $extraConditions
      replyWithCount: true
    ) {
      total
      list {
        uuid
        vmUuid
        vm {
          name
          uuid
        }
        cause
        vmSourceHostUuid
        sourceHost {
          name
          uuid
        }
        vmTargetHostUuid
        targetHost {
          name
          uuid
        }
        clusterName
        reason
        drsUuid
        createDate
        endDate
        status
      }
    }
  }
`;

const MigrationActivityList: React.FC<IListProps<OperationLog>> = (props) => {
  const columnConfig = useColumnConfig();

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
    ];

    return {
      conditions: baseCondition,
    };
  }, [postClientTime]);

  const [query, setQuery] = useState<IQuery>(() =>
    merge({}, defaultQuery, { start: 0, limit: 20 }),
  );
  const queryConfig = useQueryConfig(query);

  const refetchAll = (newQuery?: IQuery) => {
    setQuery(merge({}, newQuery, { type: genUuid() }));
  };

  return (
    <>
      <TableList
        type="MigrationActivitylog"
        rowSelection={false}
        defaultQuery={query}
        renderMiddleToolbar={() => (
          <Toolbar
            defaultQueryDaysNum={7}
            refetchAll={refetchAll}
            query={query}
            setQuery={setQuery}
          />
        )}
        toolbar={["search"]}
        gql={queryDRSVmMigrationActivityList}
        resource="migration.activity.log"
        columnConfig={columnConfig}
        queryConfig={queryConfig}
        {...props}
      />
    </>
  );
};

export default MigrationActivityList;
