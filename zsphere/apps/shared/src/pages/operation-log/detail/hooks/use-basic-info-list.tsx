import { useTime } from "@zstack/hooks";
import { Progress } from "@zstack/zsphere-components";
import type { OperationLongjobStatus } from "@zstack/zsphere-types";
import { OperationStatus as IStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { includes as _includes, floor as _floor } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { getAllLongjobs } from "../../action/validators";
import OperationStatus from "../../components/operation-status";
import { getUseTime } from "../../config/useColumnConfig";
import OperationProgress from "../components/operation-progress";
import useOperation from "../hooks";
import type { ITaskProgressInfo } from "../index";
import { migrateVmApiType } from "../index";
import { useUploadImageCountDown } from "./use-upload-image-countdown";
import { useUploadImageSpeed } from "./use-upload-image-speed";

import style from "../style.module.less";

export const useBasicInfoList = (
  operationLog: OperationLog | undefined,
  resourceName: string,
  isMultipleOperation: boolean,
  longJobState?: OperationLongjobStatus,
  _taskProgressInfo?: ITaskProgressInfo,
) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const { getActionFailedReason } = useOperation();
  const actionFailedReason = useMemo(() => {
    return getActionFailedReason(operationLog);
  }, [getActionFailedReason, operationLog]);

  const currentLongjob = useMemo(
    () => (operationLog ? getAllLongjobs(operationLog)?.[0] : undefined),
    [operationLog],
  );
  const operationLogLongJobData = currentLongjob?.data;
  const longjobReqJobData = useMemo(() => {
    try {
      return JSON.parse(operationLogLongJobData || "{}");
    } catch {
      return {};
    }
  }, [operationLogLongJobData]);

  const { countDown } = useUploadImageCountDown(operationLog, longJobState);
  const { speed, complete } = useUploadImageSpeed(operationLog, longJobState);

  const basicInfoList = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "task.description",
          defaultMessage: "Task Description",
        }),
        value: operationLog?.name,
      },
      {
        label: intl.formatMessage({
          id: "object",
          defaultMessage: "Target",
        }),
        value: resourceName,
      },
      {
        label: intl.formatMessage({
          id: "resource.amount",
          defaultMessage: "Resources",
        }),
        value: operationLog?.operationTasks?.length,
      },
      {
        label: intl.formatMessage({
          id: "task.result",
          defaultMessage: "Task Result",
        }),
        value: (
          <div className={style.flex} style={{ paddingRight: 12 }}>
            <OperationStatus operationLog={operationLog!} />
            {operationLog?.status === IStatus.Running && (
              <div style={{ flex: "1 1" }}>
                <OperationProgress log={operationLog!} />
              </div>
            )}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "api.pause.reason",
          defaultMessage: "Pause Reason",
        }),
        value: (
          <div className={style.pausedReason}>
            {`uploading has been inactive more than 30
            sec`}
          </div>
        ),
        show: operationLog?.status === IStatus.Suspended,
      },
      {
        label: intl.formatMessage({
          id: "failedReason",
          defaultMessage: "Failure Cause",
        }),
        value: <div className={style.failedReason}>{actionFailedReason}</div>,
        show: !isMultipleOperation && actionFailedReason,
      },
      {
        label: intl.formatMessage({
          id: "migrate.bandWidth",
          defaultMessage: "Migration Bandwidth",
        }),
        value: longjobReqJobData?.bandwidth
          ? `${longjobReqJobData?.bandwidth} MB/s`
          : intl.formatMessage({
              id: "unlimited",
              defaultMessage: "Unlimited",
            }),
        show: _includes(migrateVmApiType, currentLongjob?.jobName),
      },
      {
        label: intl.formatMessage({
          id: "migrate.speed",
          defaultMessage: "Migration Rate",
        }),
        value: _taskProgressInfo?.speed || " - ",
        show: _includes(migrateVmApiType, currentLongjob?.jobName),
      },
      {
        label: intl.formatMessage({
          id: "migrate.dataSize",
          defaultMessage: "Data Migrated",
        }),
        value:
          operationLog?.status === IStatus.Running ? (
            <div className={style.progress}>
              <Progress.Bar
                percent={
                  _taskProgressInfo?.remain && _taskProgressInfo?.total
                    ? _floor(
                        ((_taskProgressInfo?.total -
                          _taskProgressInfo?.remain) /
                          _taskProgressInfo?.total) *
                          100,
                      )
                    : 0
                }
                mode="light"
                strokeColor="#0076F7"
                format={() => (
                  <div>
                    {_taskProgressInfo?.remain &&
                      _taskProgressInfo?.total &&
                      intl.formatMessage(
                        {
                          id: "surplus.data.size",
                          defaultMessage: "Migrated {dataSize}",
                        },
                        {
                          dataSize: (
                            <div className={style.surplusDataSize}>
                              {formatStorage(
                                _taskProgressInfo?.total -
                                  _taskProgressInfo?.remain,
                                2,
                              )}
                            </div>
                          ),
                        },
                      )}
                  </div>
                )}
              />
            </div>
          ) : (
            "-"
          ),
        show: _includes(migrateVmApiType, currentLongjob?.jobName),
      },
      {
        label: intl.formatMessage({
          id: "autoconvergencePolicy",
          defaultMessage: "Auto-Converge",
        }),
        value: longjobReqJobData?.strategy
          ? intl.formatMessage({
              id: "autoconvergencePolicy.enabled",
              defaultMessage: "Enabled",
            })
          : intl.formatMessage({
              id: "autoconvergencePolicy.disable",
              defaultMessage: "Disabled",
            }),
        show:
          _includes(migrateVmApiType, currentLongjob?.jobName) &&
          !longjobReqJobData?.dstHostUuid,
      },
      {
        label: intl.formatMessage({
          id: "uploadSpeed",
          defaultMessage: "Upload Speed",
        }),
        canModify: true,
        value: speed,
      },
      {
        label: intl.formatMessage({
          id: "start.time",
          defaultMessage: "Start Time",
        }),
        value:
          operationLog?.createDate &&
          getServerTime(parseInt(operationLog?.createDate, 10)).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
      },
      {
        label: intl.formatMessage({
          id: "remainTime",
          defaultMessage: "Time Remained",
        }),
        canModify: true,
        value: countDown,
      },
      {
        label: intl.formatMessage({
          id: "finishDate",
          defaultMessage: "Completion Time",
        }),
        value:
          operationLog?.lastOpDate &&
          getServerTime(parseInt(operationLog?.lastOpDate, 10)).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
      },
      {
        label: intl.formatMessage({
          id: "used.time",
          defaultMessage: "Time Consumed",
        }),
        value: getUseTime(operationLog, intl),
      },
      {
        label: intl.formatMessage({
          id: "operator",
          defaultMessage: "Operator",
        }),
        value: operationLog?.accountName,
      },
      {
        label: intl.formatMessage({
          id: "loginIP",
          defaultMessage: "Login IP",
        }),
        value: operationLog?.loginIp,
      },
      {
        label: "Action ID",
        value: operationLog?.actionId,
        copyable: true,
      },
    ];
  }, [
    operationLog,
    resourceName,
    isMultipleOperation,
    actionFailedReason,
    speed,
    countDown,
    longjobReqJobData,
    currentLongjob?.jobName,
    _taskProgressInfo,
    getServerTime,
    intl,
  ]);
  return { basicInfoList, complete };
};
