import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { SchedulerJobHistory } from "@zstack/zsphere-types/graphql";
import { useDebounceFn } from "ahooks";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactJSON from "react-json-view";

import Status, { getStatus, formatStatusText } from "./status";

import style from "./style.module.less";

export interface IApiDetail {
  current?: SchedulerJobHistory;
  onClose?: () => void;
}

export default function ApiDetail({ current, onClose }: IApiDetail) {
  const intl = useIntl();
  const status = getStatus(current);
  const request = useMemo(
    () => (current?.requestDump ? JSON.parse(current.requestDump) : {}),
    [current],
  );
  const response = useMemo(
    () =>
      current?.resultDump && current.resultDump !== "Running"
        ? JSON.parse(current.resultDump)
        : {},
    [current],
  );

  const handleCopy = () =>
    copy(
      JSON.stringify(
        {
          [intl.formatMessage({ id: "apiName", defaultMessage: "API Name" })]:
            "CreateVolumeSnapshotGroupJob",
          [intl.formatMessage({
            id: "api.called.result",
            defaultMessage: "API Result",
          })]: formatStatusText(intl, status),
          [intl.formatMessage({
            id: "failedReason",
            defaultMessage: "Failure Cause",
          })]: response.error?.details,
          [intl.formatMessage({
            id: "start.time",
            defaultMessage: "Start Time",
          })]:
            current?.startTime &&
            dayjs(new Date(current.startTime)).format("YYYY-MM-DD HH:mm:ss"),
          [intl.formatMessage({
            id: "finishDate",
            defaultMessage: "Completion Time",
          })]:
            current?.endTime &&
            dayjs(Number(current.endTime)).format("YYYY-MM-DD HH:mm:ss"),
          "API ID": request.id,
          [intl.formatMessage({
            id: "error.response",
            defaultMessage: "Error Response",
          })]: status === "Failed" ? response : undefined,
          [intl.formatMessage({ id: "request", defaultMessage: "Request" })]:
            request,
          [intl.formatMessage({ id: "return", defaultMessage: "Response" })]:
            status !== "Failed" ? response : undefined,
        },
        null,
        2,
      ),
    );

  const basicList = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({ id: "apiName", defaultMessage: "API Name" }),
        value: "CreateVolumeSnapshotGroupJob",
      },
      {
        label: intl.formatMessage({
          id: "api.called.result",
          defaultMessage: "API Result",
        }),
        value: <Status current={current} />,
      },
      {
        label: intl.formatMessage({
          id: "failedReason",
          defaultMessage: "Failure Cause",
        }),
        value: response.error?.details && (
          <div className={style.failedReason}>{response.error.details}</div>
        ),
        show: status === "Failed",
      },
      {
        label: intl.formatMessage({
          id: "start.time",
          defaultMessage: "Start Time",
        }),
        value:
          current?.startTime &&
          dayjs(new Date(current.startTime)).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: intl.formatMessage({
          id: "finishDate",
          defaultMessage: "Completion Time",
        }),
        value:
          current?.endTime &&
          dayjs(Number(current.endTime)).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: "API ID",
        value: request.id,
        copyable: true,
      },
    ],
    [current, intl, request, response, status],
  );

  return (
    <div className={style.apiDetail}>
      <div className={style.apiDetailHeader}>
        <Button
          variant="link"
          size="sm"
          className={style.returnBtn}
          icon={<Icon className={style.icon} type="arrow-ios-left" />}
          onClick={onClose}
        >
          {intl.formatMessage({ id: "return", defaultMessage: "Response" })}
        </Button>
        <CopyButton onClick={handleCopy} />
      </div>
      <DraggableCard
        title={intl.formatMessage({
          id: "basicInfo",
          defaultMessage: "Basic Info",
        })}
        isList
      >
        <List list={basicList} bordered={false} />
      </DraggableCard>
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
        title={intl.formatMessage({ id: "request", defaultMessage: "Request" })}
      >
        <div className={style.json}>
          <ReactJSON src={request} enableClipboard={false} />
        </div>
      </DraggableCard>
      {status !== "Failed" && (
        <DraggableCard
          title={intl.formatMessage({ id: "return", defaultMessage: "Response" })}
        >
          <div className={style.json}>
            <ReactJSON src={response} enableClipboard={false} />
          </div>
        </DraggableCard>
      )}
    </div>
  );
}

interface ICopyButtonProps {
  onClick?: () => void;
}

function CopyButton({ onClick }: ICopyButtonProps) {
  const intl = useIntl();
  const [copied, setCopied] = useState(false);
  const { run: resetCopied } = useDebounceFn(() => {
    setCopied(false);
  });
  return (
    <Button
      variant="primary"
      size="sm"
      ghost
      className={style.copyBtn}
      icon={copied ? <Icon type="checkmark" /> : <Icon type="copy" />}
      onClick={() => {
        if (onClick) {
          setCopied(true);
          onClick();
          resetCopied();
        }
      }}
    >
      {intl.formatMessage({ id: "copy.detail", defaultMessage: "Copy Details" })}
    </Button>
  );
}
