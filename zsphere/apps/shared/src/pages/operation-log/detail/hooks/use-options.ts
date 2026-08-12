import type { Select } from "@zstack/zsphere-components";
import type { OperationStatus as IStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { groupBy } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { useTextMap } from "../../components/operation-status";

export const useOptions = (operationLog: OperationLog | undefined) => {
  const intl = useIntl();
  const textMap = useTextMap();
  return useMemo<(typeof Select)["arguments"]["options"]>(() => {
    const { operationTasks = [] } = operationLog || {};
    const taskGroup = groupBy(operationTasks, "status");
    const keys = Object.keys(taskGroup);
    return [
      {
        key: "all",
        label: `${intl.formatMessage({ id: "all.result", defaultMessage: "All Results" })}(${
          operationTasks.length
        })`,
        value: "all",
      },
    ].concat(
      keys.map((key) => {
        return {
          key,
          label: `${(textMap as any)[key as IStatus]}(${taskGroup[key].length})`,
          value: key,
        };
      }),
    );
  }, [intl, operationLog, textMap]);
};
