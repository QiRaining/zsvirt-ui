import { Drawer, DrawerHeader, DrawerBody } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Field } from "@zstack/zsphere-components";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { SchedulerJobHistory as ISchedulerJobHistory } from "@zstack/zsphere-types/graphql";
import { get as _get } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactJSON from "react-json-view";

import SchedulerJobHistoryList from "../../scheduler-job-history/list";

import style from "./style.module.less";

const toJsonParseObj = (resource: string) => {
  try {
    return JSON.parse(resource);
  } catch {
    return {};
  }
};

const SchedulerJobHistoryDetail: React.FC<
  IActionWrapperProps<ISchedulerJobHistory>
> = ({ visible, setVisible, selectedList }) => {
  const intl = useIntl();
  const fireInstanceId = selectedList?.[0]?.fireInstanceId;

  const expandedRowRender = (record: ISchedulerJobHistory) => {
    const requestDump = toJsonParseObj(String(record?.requestDump));
    const resultDump = toJsonParseObj(String(record?.resultDump));
    const error = _get(resultDump, "error");

    return (
      <div className={style["json-content"]}>
        {error && (
          <Field
            className={style.error}
            label={intl.formatMessage({
              id: "action.error.info",
              defaultMessage: "Error Message",
            })}
          >
            <ReactJSON src={error} />
          </Field>
        )}

        <Field
          className={style.info}
          label={intl.formatMessage({
            id: "action.request",
            defaultMessage: "Request",
          })}
        >
          <ReactJSON src={requestDump} />
        </Field>

        <Field
          className={style.info}
          label={intl.formatMessage({
            id: "response",
            defaultMessage: "Response",
          })}
        >
          <ReactJSON src={resultDump} />
        </Field>
      </div>
    );
  };

  return (
    <Drawer
      open={visible}
      setOpen={(v) => {
        if (typeof v === "function") {
          setVisible(v(visible));
        } else {
          setVisible(v);
        }
      }}
      placement="right"
      style={{ width: 800 }}
    >
      <DrawerHeader onClose={() => setVisible(false)}>
        {intl.formatMessage({
          id: "scheduler.job.history.detail",
          defaultMessage: "Job Details",
        })}
      </DrawerHeader>
      <DrawerBody>
        <SchedulerJobHistoryList
          tableProps={{ sticky: false }}
          view="sub.scheduler.job.history.detail"
          toolbar={[]}
          rowSelection={false}
          rowKey={
            ((record: ISchedulerJobHistory) =>
              `${record.fireInstanceId}-${record.id}`) as any
          }
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <Icon
                  type="arrow-ios-down"
                  onClick={(e) => onExpand(record, e)}
                />
              ) : (
                <Icon
                  type="arrow-ios-right"
                  onClick={(e) => onExpand(record, e)}
                />
              ),
            expandedRowRender,
          }}
          defaultQuery={{
            conditions: [
              {
                key: "fireInstanceId",
                op: Op.eq,
                value: fireInstanceId,
              },
            ],
          }}
        />
      </DrawerBody>
    </Drawer>
  );
};

export default SchedulerJobHistoryDetail;
