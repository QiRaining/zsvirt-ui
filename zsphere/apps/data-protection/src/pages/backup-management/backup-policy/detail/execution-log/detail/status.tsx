import { State } from "@zstack/zsphere-components";
import type { SchedulerJobHistory } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import type { IntlShape } from "react-intl";

export function getStatus(current?: SchedulerJobHistory) {
  if (!current) {
    return "Unknown";
  }
  if (current?.resultDump === "Running") {
    return "Running";
  }
  if (current?.success) {
    return "Success";
  }
  return "Failed";
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

function getStatusType(status: StatusType) {
  if (status === "Running") {
    return "progress";
  }
  if (status === "Success") {
    return "success";
  }
  return "error";
}

export interface IStatusProps {
  current?: SchedulerJobHistory;
}

export default function Status({ current }: IStatusProps) {
  const intl = useIntl();
  const status = getStatus(current);
  const type = getStatusType(status);
  const value = formatStatusText(intl, status);
  return <State type={type} name={value} />;
}
