import { Drawer, DrawerHeader, DrawerBody } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { List, DraggableCard, State } from "@zstack/zsphere-components";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { translateSchedTypes } from "../config/translate";

import style from "./style.module.less";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  logData?: any;
}

const LogDetail: React.FC<IProps> = ({ logData, visible, setVisible }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const getResult = useMemo(() => {
    if (!logData) {
      return "";
    }
    const flag = logData?.success;
    return (
      <State
        type={flag ? "success" : "error"}
        name={
          flag
            ? intl.formatMessage({ id: "success", defaultMessage: "Succeeded" })
            : intl.formatMessage({ id: "fault", defaultMessage: "Failed" })
        }
      />
    );
  }, [intl, logData]);

  const basicInfoList = useMemo(() => {
    if (logData) {
      const {
        vmInstance,
        success,
        failReason = "无",
        schedType,
        schedReason,
      } = logData;

      return [
        {
          label: intl.formatMessage({
            id: "task.description",
            defaultMessage: "Task Description",
          }),
          value: translateSchedTypes(intl, schedType),
        },
        {
          label: intl.formatMessage({
            id: "object",
            defaultMessage: "Target",
          }),
          value: vmInstance?.name,
        },
        {
          label: intl.formatMessage({
            id: "trigger.reason",
            defaultMessage: "Trigger Reason",
          }),
          value: <>{schedReason}</>,
        },
        {
          label: intl.formatMessage({
            id: "task.result",
            defaultMessage: "Task Result",
          }),
          value: <>{getResult}</>,
        },
        {
          label: intl.formatMessage({
            id: "failedReason",
            defaultMessage: "Failure Cause",
          }),
          value: <div className={style.failedReason}>{failReason}</div>,
          show: !success,
        },
        {
          label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
          value: logData?.owner?.name,
        },

        {
          label: intl.formatMessage({
            id: "zsv.pre.host",
            defaultMessage: "Previous Host",
          }),
          value: logData?.preHost?.name ?? "无",
        },
        {
          label: intl.formatMessage({
            id: "zsv.target.host",
            defaultMessage: "Target Host",
          }),
          value: logData?.destHost?.name ?? "无",
        },
        {
          label: intl.formatMessage({
            id: "startTime",
            defaultMessage: "Start Time",
          }),
          value: getServerTime(logData?.createDate).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
        },
        {
          label: intl.formatMessage({
            id: "finishTime",
            defaultMessage: "Completion Time",
          }),
          value: getServerTime(logData?.lastOpDate).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
        },
      ];
    }

    return [];
  }, [logData, intl, getServerTime, getResult]);

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
      style={{ width: 600 }}
    >
      <DrawerHeader onClose={() => setVisible(false)}>
        {intl.formatMessage({
          id: "task.detail",
          defaultMessage: "Task Details",
        })}
      </DrawerHeader>
      <DrawerBody>
        <div key="ActionDetail">
          <div className={style.operationDetail}>
            <DraggableCard
              className={style.card}
              title={intl.formatMessage({
                id: "baseInfo",
                defaultMessage: "Basic Info",
              })}
            >
              <List list={basicInfoList} bordered={false} />
            </DraggableCard>
          </div>
        </div>
      </DrawerBody>
    </Drawer>
  );
};

export default LogDetail;
