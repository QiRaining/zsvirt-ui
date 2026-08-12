import { Button } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { OperationApi } from "@zstack/zsphere-types/graphql";
import { useDebounceFn } from "ahooks";
import cls from "classnames";
import React, { useMemo, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import ReactJSON from "react-json-view";

import { useStateMap, useTextMap } from "../components/operation-status";

import style from "./style.module.less";

interface IProps {
  api: OperationApi;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const ApiDetail: React.ForwardRefRenderFunction<any, IProps> = (
  { api, setVisible },
  ref,
) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const { status, lastOpDate, createDate, req: _req, resp: _resp, apiId } = api;
  const textMap = useTextMap();
  const { renderState } = useStateMap();
  const req = useMemo(() => {
    try {
      const rs = JSON.parse(_req || "{}");
      if (rs.jobData) {
        rs.jobData = JSON.parse(rs.jobData);
      }
      return rs;
    } catch {
      return {};
    }
  }, [_req]);
  const resp = useMemo(() => {
    try {
      const rs = JSON.parse(_resp || "{}");
      if (rs.inventory?.jobData) {
        rs.inventory.jobData = JSON.parse(rs.inventory.jobData);
      }
      return rs;
    } catch {
      return {};
    }
  }, [_resp]);
  const isFailed = useMemo(() => {
    return status === "Failed";
  }, [status]);
  const failedReason = useMemo(() => {
    if (!isFailed) {
      return "";
    }
    try {
      const jobResult = JSON.parse(resp.jobResult ?? "{}");
      return (
        resp.error?.messages?.[
          intl.locale === "zh-CN" ? "message_cn" : "message_en"
        ] ||
        resp.error?.details ||
        jobResult?.detail
      );
    } catch {
      return "";
    }
  }, [intl.locale, isFailed, resp]);

  const [copySuccessVisible, setCopySuccessVisible] = useState<boolean>(false);

  const { run: changeVisible } = useDebounceFn(() => {
    setCopySuccessVisible(false);
  });

  const copyToClipboard = useCallback(() => {
    const inputEl = document.body.appendChild(
      document.createElement("textarea"),
    );
    inputEl.value = JSON.stringify(
      {
        [intl.formatMessage({
          id: "api.called.result",
          defaultMessage: "API Result",
        })]: textMap[status],
        [intl.formatMessage({
          id: "failedReason",
          defaultMessage: "Failure Cause",
        })]: failedReason || undefined,
        [intl.formatMessage({
          id: "operationDate",
          defaultMessage: "Operation Time",
        })]: createDate
          ? getServerTime(parseInt(createDate, 10)).format(
              "YYYY-MM-DD HH:mm:ss",
            )
          : null,
        [intl.formatMessage({ id: "finishDate", defaultMessage: "Completion Time" })]:
          lastOpDate
            ? getServerTime(parseInt(lastOpDate, 10)).format(
                "YYYY-MM-DD HH:mm:ss",
              )
            : null,
        "API ID": apiId,
        [intl.formatMessage({ id: "request", defaultMessage: "Request" })]: req,
        [isFailed
          ? intl.formatMessage({
              id: "error.response",
              defaultMessage: "Error Response",
            })
          : intl.formatMessage({ id: "return", defaultMessage: "Response" })]: resp,
      },
      null,
      2,
    );
    inputEl.focus();
    inputEl.select();
    document.execCommand("copy");
    inputEl.parentNode?.removeChild(inputEl);
    setCopySuccessVisible(true);
    changeVisible();
  }, [
    apiId,
    changeVisible,
    createDate,
    failedReason,
    getServerTime,
    intl,
    isFailed,
    lastOpDate,
    req,
    resp,
    status,
    textMap,
  ]);

  const currentApiBasicInfo = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: "apiName", defaultMessage: "API Name" }),
        value: api.name,
      },
      {
        label: intl.formatMessage({
          id: "api.called.result",
          defaultMessage: "API Result",
        }),
        value: renderState({ name: textMap[status], status: status as any }),
      },
      {
        label: intl.formatMessage({
          id: "failedReason",
          defaultMessage: "Failure Cause",
        }),
        value: <div className={style.failedReason}>{failedReason}</div>,
        show: isFailed,
      },
      {
        label: intl.formatMessage({
          id: "start.time",
          defaultMessage: "Start Time",
        }),
        value:
          api?.createDate &&
          getServerTime(parseInt(api?.createDate, 10)).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
      },
      {
        label: intl.formatMessage({
          id: "finishDate",
          defaultMessage: "Completion Time",
        }),
        value:
          api?.lastOpDate &&
          getServerTime(parseInt(api?.lastOpDate, 10)).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
      },
      {
        label: "API ID",
        value: api.apiId,
        copyable: true,
      },
    ];
  }, [api, isFailed, intl]);

  return (
    <div ref={ref}>
      <div className={style.apiTitleContainer}>
        <div
          className={style.apiTitle}
          onClick={() => {
            setVisible(false);
          }}
        >
          <Icon className={style.icon} type="arrow-ios-left" />
          <span>
            {intl.formatMessage({ id: "return", defaultMessage: "Response" })}
          </span>
        </div>
        <Button
          variant="link"
          icon={
            copySuccessVisible ? (
              <Icon type="checkmark" />
            ) : (
              <Icon type="copy" />
            )
          }
          size="small"
          className={style.copyBtn}
          onClick={copyToClipboard}
        >
          {intl.formatMessage({
            id: "copy.detail",
            defaultMessage: "Copy Details",
          })}
        </Button>
      </div>
      <div className={style.apiBodyContainer}>
        <DraggableCard
          className={style.card}
          title={intl.formatMessage({
            id: "baseInfo",
            defaultMessage: "Basic Info",
          })}
        >
          <List list={currentApiBasicInfo} bordered={false} />
        </DraggableCard>
        {isFailed && (
          <DraggableCard
            className={style.card}
            title={intl.formatMessage({
              id: "error.response",
              defaultMessage: "Error Response",
            })}
          >
            <ReactJSON src={resp} enableClipboard={false} />
          </DraggableCard>
        )}

        <DraggableCard
          className={cls({ [style.card]: !isFailed })}
          title={intl.formatMessage({ id: "request", defaultMessage: "Request" })}
        >
          <ReactJSON src={req} enableClipboard={false} />
        </DraggableCard>
        {!isFailed && (
          <DraggableCard
            title={intl.formatMessage({ id: "return", defaultMessage: "Response" })}
          >
            <ReactJSON src={resp} enableClipboard={false} />
          </DraggableCard>
        )}
      </div>
    </div>
  );
};

export default React.forwardRef(ApiDetail);
