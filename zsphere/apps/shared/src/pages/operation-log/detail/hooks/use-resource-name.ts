import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { filter, map, get } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export const useResourceName = (operationLog: OperationLog | undefined) => {
  const intl = useIntl();
  return useMemo(() => {
    {
      if (operationLog?.resourceNames?.length) {
        return operationLog?.resourceNames.join("/");
      }
      try {
        const _resourceName = filter(
          map(
            get(operationLog, "operationTasks.[0].operationApis"),
            "resourceName",
          ),
          (e) => !!e,
        )?.[0];
        const resourceUuid = JSON.parse(
          get(operationLog, "operationTasks.[0].operationApis.[0].req") || "{}",
        ).uuid;
        if (operationLog?.operationTasks?.length === 1) {
          return _resourceName || resourceUuid;
        }

        if ((operationLog?.operationTasks?.length ?? 0) > 1) {
          const displayName = _resourceName || resourceUuid;
          if (displayName) {
            return intl.formatMessage(
              {
                id: "task.object.count",
                defaultMessage: `{name} has {count} items.`,
              },
              {
                name: displayName,
                count: operationLog?.operationTasks?.length,
              },
            );
          }
        }

        return "-";
      } catch {
        return "-";
      }
    }
  }, [operationLog]);
};
