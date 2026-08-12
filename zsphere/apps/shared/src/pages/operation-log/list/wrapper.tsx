import { useUserIdentity } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import { memo, useMemo } from "react";

import OperationList from "./index";

import style from "./style.module.less";

export default memo(function OperationListWrapper() {
  const { currentUser } = usePlatformStore();

  const { isNormalAccount } = useUserIdentity();

  const operationLogDefaultQuery = useMemo<IQuery>(() => {
    const baseCondition: IQuery["conditions"] = [];
    if (isNormalAccount) {
      baseCondition.push(
        {
          key: "userId",
          op: Op.eq,
          value: currentUser?.userUuid,
        },
        {
          key: "createDateDuration",
          value: JSON.stringify([7, "days"]),
        },
      );
    }
    return {
      conditions: baseCondition,
      limit: 50,
    };
  }, [currentUser, isNormalAccount]);

  return (
    <OperationList
      fixHeaderOnTop={false}
      pagination={false}
      defaultQuery={operationLogDefaultQuery}
      toolbar={false}
      view="main.global"
      className={style.tableListWrap}
      disabledLoading
    />
  );
});
