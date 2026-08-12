import { State } from "@zstack/zsphere-components";
import { OperationStatus as IStatus } from "@zstack/zsphere-types";
import type {
  OperationApi,
  OperationLog,
  OperationTask,
} from "@zstack/zsphere-types/graphql";
import { groupBy, toNumber, floor, flatten } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  operationLog: OperationLog;
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const useTextMap = () => {
  const intl = useIntl();
  const textMap = {
    [IStatus.Success]: intl.formatMessage({
      id: "success",
      defaultMessage: "Succeeded",
    }),
    [IStatus.Failed]: intl.formatMessage({
      id: "failed",
      defaultMessage: "Failed",
    }),
    [IStatus.Canceled]: intl.formatMessage({
      id: "canceled",
      defaultMessage: "Canceled",
    }),
    [IStatus.Canceling]: intl.formatMessage({
      id: "canceling",
      defaultMessage: "Canceling",
    }),
    [IStatus.Exception]: intl.formatMessage({
      id: "exception",
      defaultMessage: "Abnormal",
    }),
    [IStatus.Running]: intl.formatMessage({
      id: "ongoing",
      defaultMessage: "Ongoing",
    }),
    [IStatus.Timeout]: intl.formatMessage({
      id: "timeout",
      defaultMessage: "Timeout",
    }),
    [IStatus.Suspended]: intl.formatMessage({
      id: "Suspended",
      defaultMessage: "Suspended",
    }),
    [IStatus.Unknown]: intl.formatMessage({
      id: "constant.UNKNOWN",
      defaultMessage: "Unknown",
    }),
  };
  return textMap;
};

export const useFormatName = (log: OperationLog) => {
  const textMap = useTextMap();
  const formatName = (operationLog: OperationLog) => {
    const { operationTasks, status } = operationLog;
    const taskGroup = groupBy(operationTasks, "status");
    if (status === IStatus.Timeout) {
      return textMap[IStatus.Timeout];
    }
    return Object.keys(taskGroup)
      .map(
        (cv) =>
          `${textMap[cv as IStatus]}${
            taskGroup[cv].length > 1 || Object.keys(taskGroup).length > 1
              ? taskGroup[cv].length
              : ""
          }`,
      )
      .join("，");
  };
  return formatName(log);
};

export const useStateMap = () => {
  const renderState = ({ name, status }: { name: string; status: IStatus }) => {
    const stateMap = {
      [IStatus.Exception]: (
        <State
          icon="alert-triangle-fill"
          color={{ color: "alert", number: 500 }}
          name={name}
        />
      ),
      [IStatus.Success]: (
        <State
          icon="checkmark-circle-fill"
          color={{ color: "positive", number: 500 }}
          name={name}
        />
      ),
      [IStatus.Failed]: (
        <State
          icon="close-circle-fill"
          color={{ color: "danger", number: 500 }}
          type="error"
          name={name}
        />
      ),
      [IStatus.Canceled]: (
        <State
          icon="minus-circle-fill"
          color={{ color: "neutral", number: 500 }}
          name={name}
        />
      ),
      [IStatus.Running]: (
        <State
          icon="loader"
          color={{ color: "info", number: 500 }}
          name={name}
        />
      ),
      [IStatus.Canceling]: (
        <State
          icon="loader"
          color={{ color: "info", number: 500 }}
          name={name}
        />
      ),
      [IStatus.Timeout]: (
        <State
          icon="clock-fill"
          color={{ color: "neutral", number: 500 }}
          name={name}
        />
      ),
      [IStatus.Suspended]: (
        <State
          icon="pause-circle-fill"
          color={{ color: "alert", number: 500 }}
          name={name}
        />
      ),
      [IStatus.Unknown]: (
        <State
          icon="question-mark-circle-fill"
          color={{ color: "neutral", number: 500 }}
          name={name}
        />
      ),
      //需要加入一个默认值
    };
    return (
      stateMap[capitalizeFirstLetter(status.toLowerCase()) as IStatus] || name
    );
  };
  return {
    renderState,
  };
};

export const computeProgress = (operationLog: OperationLog) => {
  const allProgress = operationLog.operationTasks?.length || 0;
  if (!allProgress) {
    return 100;
  }
  const baseProgress =
    operationLog.operationTasks?.filter((cv) => cv.status !== IStatus.Running)
      ?.length || 0;
  const simulateProgress =
    operationLog.operationTasks?.filter((cv) => cv.status === IStatus.Running)
      ?.length || 0;
  if (!simulateProgress) {
    return 100;
  }
  const basePercent = (baseProgress / allProgress) * 100; // 基础进度
  // 模拟进度 n/n+1
  const getSingleProgress = () => {
    return (
      (Date.now() - toNumber(operationLog.createDate)) /
      (Date.now() - toNumber(operationLog.createDate) + 1 * 1000)
    );
  };
  // ((100 - basePercent) / simulateProgress) * (n / n + 1)
  const simulatePercent =
    ((100 - basePercent) * getSingleProgress()) / simulateProgress;
  return floor(basePercent + simulatePercent, 2);
};

const handleSuccess = (operationTasks: OperationTask[]) => {
  const list = operationTasks.map((cv: any) =>
    cv?.operationApis.map((cv2: any) => cv2.status),
  );
  const statusFlattenList = flatten(list);

  if (statusFlattenList.every((cv) => cv === IStatus.Success)) {
    return IStatus.Success;
  }

  if (statusFlattenList.every((cv) => cv === IStatus.Failed)) {
    return IStatus.Failed;
  }
  return IStatus.Exception;
};

const OperationStatus: React.FC<IProps> = ({ operationLog }) => {
  // const name = useFormatName(operationLog)

  const { status, operationTasks = [] } = operationLog;
  const opStatus =
    status === IStatus.Success ? handleSuccess(operationTasks) : status;
  const { renderState } = useStateMap();
  const textMap = useTextMap();
  return renderState({
    name: textMap[opStatus as "Success"],
    status: opStatus as IStatus,
  });
};

export const OperationTaskStatus: React.FC<{
  operationTask?: OperationTask;
}> = ({ operationTask }) => {
  const textMap = useTextMap();
  const { renderState } = useStateMap();

  if (!operationTask) {
    return null;
  }

  const { status } = operationTask;
  const name = textMap[status];
  return renderState({ name, status } as { name: string; status: IStatus });
};

export default OperationStatus;

export const OperationApiStatus: React.FC<{ operationApi?: OperationApi }> = ({
  operationApi,
}) => {
  const textMap = useTextMap();
  const { renderState } = useStateMap();

  if (!operationApi) {
    return null;
  }

  const { status } = operationApi;
  const name = textMap[status];
  return renderState({ name, status } as { name: string; status: any });
};
