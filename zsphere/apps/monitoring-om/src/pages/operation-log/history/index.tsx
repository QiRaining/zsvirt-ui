import { useTime } from "@zstack/hooks";
import { useUserIdentity } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IListProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { merge } from "lodash-es";
import React, { useMemo, useState } from "react";
import Toolbar from "zsv_shared/migration-activity/toolbar";
import List from "zsv_shared/operation-log/history";

const OperationLogList: React.FC<IListProps<OperationLog>> = (props) => {
  const { postClientTime } = useTime();
  const { isNormalAccount } = useUserIdentity();
  const { currentUser } = usePlatformStore();

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
    if (isNormalAccount) {
      baseCondition.push({
        key: "userId",
        op: Op.eq,
        value: currentUser?.userUuid ?? "",
      });
    }
    return { conditions: baseCondition };
  }, [currentUser, isNormalAccount, postClientTime]);

  const [query, setQuery] = useState<IQuery>(() =>
    merge({}, defaultQuery, { start: 0, limit: 20 }),
  );

  const refetchAll = (newQuery?: IQuery) => {
    setQuery(merge({}, newQuery, { type: genUuid() }));
  };

  return (
    <List
      {...props}
      defaultQuery={query}
      renderMiddleToolbar={() => (
        <Toolbar
          defaultQueryDaysNum={7}
          refetchAll={refetchAll}
          query={query}
          setQuery={setQuery}
        />
      )}
    />
  );
};

export default OperationLogList;
