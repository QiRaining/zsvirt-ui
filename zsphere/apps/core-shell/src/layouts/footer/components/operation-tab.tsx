import { Icon } from "@zstack/icon";
import React, { memo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface OperationTabProps {
  operationNum: number | null;
}

const OperationTab: React.FC<OperationTabProps> = memo(({ operationNum }) => {
  const intl = useIntl();

  return (
    <>
      {intl.formatMessage({ id: "task", defaultMessage: "Task" })}
      {operationNum && (
        <span className={style.number}>
          {operationNum}
          <Icon type="loader" />
        </span>
      )}
    </>
  );
});

OperationTab.displayName = "OperationTab";

export default OperationTab;
