import { Drawer, DrawerHeader, DrawerBody } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import { capitalize } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactJSON from "react-json-view";

import useSecToTime from "../list/useSecToTime";
import AuditResourceName from "./audit-resource-name";

import style from "./style.module.less";

interface AuditDetailProps {
  row?: IAudit;
  view?: string;
  visible: boolean;
  setVisible: (val: boolean) => void;
}

const Detail: React.FC<AuditDetailProps> = ({
  row = {},
  view = "main.resource",
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const { transferSecToTime } = useSecToTime();

  const { requestDump, responseDump } = row;

  const _requestDump = useMemo(() => {
    try {
      const rs = JSON.parse(requestDump || "{}");
      if (rs.jobData) {
        rs.jobData = JSON.parse(rs.jobData);
      }
      return rs;
    } catch {
      return {};
    }
  }, [requestDump]);

  const _responseDump = useMemo(() => {
    try {
      const rs = JSON.parse(responseDump || "{}");
      if (rs.inventory?.jobData) {
        rs.inventory.jobData = JSON.parse(rs.inventory.jobData);
      }
      return rs;
    } catch {
      return {};
    }
  }, [responseDump]);

  const { getServerTime } = useTime();

  const basicInfoList = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: "apiName", defaultMessage: "API Name" }),
        value: row.apiName,
      },
      {
        label: intl.formatMessage({
          id: "operation.result",
          defaultMessage: "Result",
        }),
        value: !row.isError ? (
          <div>
            <Icon
              type="checkmark-circle-fill"
              style={{ fontSize: "1em", color: "#50aa36" }}
            />{" "}
            {intl.formatMessage({ id: "success", defaultMessage: "Succeeded" })}
          </div>
        ) : (
          <div>
            <Icon
              type="close-circle-fill"
              style={{ fontSize: "1em", color: "#e03334" }}
            />{" "}
            {intl.formatMessage({ id: "failed", defaultMessage: "Failed" })}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "failedReason",
          defaultMessage: "Failure Cause",
        }),
        value: <div className={style.failedReason}>{row?.error}</div>,
        show: row.isError,
      },
      {
        label: intl.formatMessage({
          id: "consumingTime",
          defaultMessage: "Time Consumed",
        }),
        value: transferSecToTime(row.duration || 0),
      },
      ...(view !== "main.login"
        ? [
            {
              label: intl.formatMessage({
                id: "resourceName",
                defaultMessage: "Name",
              }),
              value: <AuditResourceName view={view} row={row} />,
            },
            {
              label: intl.formatMessage({
                id: "resourceType",
                defaultMessage: "Resource Type",
              }),
              value: row.resourceType || "-",
            },
            {
              label: intl.formatMessage({
                id: "resourceUuid",
                defaultMessage: "Resource UUID",
              }),
              value: row.resourceUuid || <span>-</span>,
              copyable: true,
            },
            {
              label: intl.formatMessage({
                id: "operator",
                defaultMessage: "Operator",
              }),
              value: row.operator,
            },
            {
              label: intl.formatMessage({
                id: "operator.ip",
                defaultMessage: "Operator IP",
              }),
              value: row.clientIp || <span>-</span>,
              copyable: true,
            },
            {
              label: intl.formatMessage({
                id: "operator.uuid",
                defaultMessage: "Operator UUID",
              }),
              value: row.operatorAccountUuid || <span>-</span>,
              copyable: true,
            },
          ]
        : [
            {
              label: intl.formatMessage({
                id: "operator",
                defaultMessage: "Operator",
              }),
              value: row.operator,
            },
            {
              label: intl.formatMessage({
                id: "account.uuid",
                defaultMessage: "Account UUID",
              }),
              value: row.operatorAccountUuid || <span>-</span>,
              copyable: true,
            },
            {
              label: intl.formatMessage({
                id: "login.ip",
                defaultMessage: "Login IP",
              }),
              value: row.clientIp || <span>-</span>,
              copyable: true,
            },
            {
              label: intl.formatMessage({
                id: "browser",
                defaultMessage: "Browser",
              }),
              value: row.clientBrowser ? capitalize(row.clientBrowser) : "-",
            },
          ]),
    ];
  }, [row]);

  const requestList = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "apiRequestUuid",
          defaultMessage: "API Request UUID",
        }),
        value: row.requestUuid,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "startTime",
          defaultMessage: "Start Time",
        }),
        value: getServerTime(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
      },
    ];
  }, [row]);

  const responseList = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "apiResponseUuid",
          defaultMessage: "API Response UUID",
        }),
        value: row.responseUuid,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "endTime",
          defaultMessage: "End Time",
        }),
        value: getServerTime(
          Number(row.createTime) + Number(row.duration),
        ).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: intl.formatMessage({
          id: "errorMessage",
          defaultMessage: "Error Message",
        }),
        value: <div className={style.failedReason}>{row?.error}</div>,
        show: row.isError,
      },
    ];
  }, [row]);

  return (
    <Drawer open={visible} setOpen={setVisible} style={{ width: 600 }}>
      <DrawerHeader onClose={() => setVisible(false)}>
        {intl.formatMessage({ id: "event", defaultMessage: "Event" })}
      </DrawerHeader>
      <DrawerBody>
        <div className="w-full">
          <DraggableCard
            className={style.card}
            title={intl.formatMessage({
              id: "baseInfo",
              defaultMessage: "Basic Info",
            })}
          >
            <List bordered={false} list={basicInfoList} />
          </DraggableCard>
          <div className={style.title}>
            {intl.formatMessage({
              id: "apiRequest",
              defaultMessage: "API Request",
            })}
          </div>
          <DraggableCard
            className={style.card}
            title={intl.formatMessage({
              id: "api.basicInfo",
              defaultMessage: "API Basic Information",
            })}
          >
            <List bordered={false} list={requestList} />
          </DraggableCard>
          <DraggableCard
            className={style["code-card"]}
            title={intl.formatMessage({
              id: "request",
              defaultMessage: "Request",
            })}
          >
            <ReactJSON src={_requestDump} />
          </DraggableCard>
          <div className={style.title}>
            {intl.formatMessage({
              id: "apiResponse",
              defaultMessage: "API Response",
            })}
          </div>
          <DraggableCard
            className={style.card}
            title={intl.formatMessage({
              id: "api.basicInfo",
              defaultMessage: "API Basic Information",
            })}
          >
            <List bordered={false} list={responseList} />
          </DraggableCard>
          <DraggableCard
            className={style["code-card"]}
            title={intl.formatMessage({ id: "return", defaultMessage: "Response" })}
          >
            <ReactJSON src={_responseDump} />
          </DraggableCard>
        </div>
      </DrawerBody>
    </Drawer>
  );
};

export default Detail;
