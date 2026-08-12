import { Progress } from "@zstack/zsphere-components";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import React from "react";

import { getAllLongjobs } from "../../action/validators";

interface IProps {
  log: OperationLog;
}

const OperationProgress: React.FC<IProps> = ({ log }) => {
  const longjob = getAllLongjobs(log)?.[0];
  if (longjob) {
    return (
      <Progress.Bar
        mode="light"
        colorful={false}
        size="small"
        percent={longjob?.progress ?? log?.progress ?? 0}
      />
    );
  }
  return (
    <Progress.Bar
      mode="light"
      colorful={false}
      size="small"
      percent={log?.progress ?? 0}
      needDecimal={false}
      format={false}
    />
  );
};

export default OperationProgress;
