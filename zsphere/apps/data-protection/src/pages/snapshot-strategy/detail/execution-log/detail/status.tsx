import { Constant } from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import type { SchedulerJobHistory } from "@zstack/zsphere-types/graphql";
import type { IntlShape } from "react-intl";

export function getStatus(current?: SchedulerJobHistory) {
  if (!current) {
    return null;
  }
  if (current.resultDump === "Running") {
    return ConstantEnum.Running;
  }
  if (current.success) {
    return ConstantEnum.Success;
  }
  return ConstantEnum.Failed;
}

export type StatusType = ReturnType<typeof getStatus>;

export function formatStatusText(intl: IntlShape, status: StatusType) {
  switch (status) {
    case "Running":
      return intl.formatMessage({ id: "ongoing", defaultMessage: "Ongoing" });
    case "Success":
      return intl.formatMessage({ id: "success", defaultMessage: "Succeeded" });
    case "Failed":
      return intl.formatMessage({ id: "fail", defaultMessage: "Failed" });
    default:
      return intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" });
  }
}

export interface IStatusProps {
  current?: SchedulerJobHistory;
}

export default function Status({ current }: IStatusProps) {
  const status = getStatus(current);
  return status ? (
    <Constant value={status} enumType={ConstantType.OperationLogState} />
  ) : null;
}
