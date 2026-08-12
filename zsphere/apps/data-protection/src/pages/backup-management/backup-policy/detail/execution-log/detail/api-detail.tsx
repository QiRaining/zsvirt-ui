import { DraggableCard } from "@zstack/zsphere-components";
import type { SchedulerJobHistory } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactJSON from "react-json-view";

import { getStatus } from "./status";

import style from "./style.module.less";

export interface IApiDetail {
  current?: SchedulerJobHistory;
}

export default function ApiDetail({ current }: IApiDetail) {
  const intl = useIntl();
  const status = getStatus(current);
  const request = useMemo(
    () => (current?.requestDump ? JSON.parse(current.requestDump) : {}),
    [current],
  );
  const response = useMemo(() => {
    if (!current?.resultDump || current.resultDump === "Running") {
      return {};
    }
    const result = JSON.parse(current.resultDump);
    if (result.inventories) {
      result.inventories.forEach((item: any) => {
        if (item.metadata && typeof item.metadata === "string") {
          item.metadata = JSON.parse(item.metadata);
        }
      });
    }
    return result;
  }, [current]);

  return (
    <div className={style.apiDetail}>
      {status === "Failed" && (
        <DraggableCard
          title={intl.formatMessage({
            id: "error.response",
            defaultMessage: "Error Response",
          })}
        >
          <div className={style.json}>
            <ReactJSON src={response} enableClipboard={false} />
          </div>
        </DraggableCard>
      )}
      <DraggableCard
        collapsed
        title={intl.formatMessage({
          id: "operation.request",
          defaultMessage: "Request",
        })}
      >
        <div className={style.json}>
          <ReactJSON src={request} enableClipboard={false} />
        </div>
      </DraggableCard>
      {status !== "Failed" && (
        <DraggableCard
          collapsed
          title={intl.formatMessage({
            id: "operation.return",
            defaultMessage: "Response",
          })}
        >
          <div className={style.json}>
            <ReactJSON src={response} enableClipboard={false} />
          </div>
        </DraggableCard>
      )}
    </div>
  );
}
