import { useLazyQuery, gql } from "@apollo/client";
import { Drawer, DrawerHeader, DrawerBody, Spin } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import {
  List,
  Empty as ZEmpty,
  DraggableCard,
  Field,
  Select,
  TaskDot,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op, OperationLongjobStatus } from "@zstack/zsphere-types";
import type {
  OperationApi,
  OperationTask,
  TaskProgressList,
} from "@zstack/zsphere-types/graphql";
import { bus, formatStorage } from "@zstack/zsphere-utils";
import { useInterval, useUpdateEffect } from "ahooks";
import { get, includes, isEmpty } from "lodash-es";
import QueueAnim from "rc-queue-anim";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import CancelLogCollect from "../action/cancel-collect-log";
import { getAllLongjobs } from "../action/validators";
import ApiDetailModal from "./api-detail";
import { ResumeButton } from "./components/resume-button";
import { useBasicInfoList } from "./hooks/use-basic-info-list";
import { useCurrentApiList } from "./hooks/use-current-api-list";
import { useCurrentTaskList } from "./hooks/use-current-task-list";
import { useFilter } from "./hooks/use-filter";
import { useIsLogCollect } from "./hooks/use-is-log-collect";
import { useOperationLog } from "./hooks/use-operation-log";
import { useOptions } from "./hooks/use-options";
import { useResourceName } from "./hooks/use-resource-name";
import { useTranslateSpeed } from "./hooks/use-translate-speed";

import style from "./style.module.less";

const operationLongjobList = gql`
  query operationLongjobList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
  ) {
    operationLongjobList(
      conditions: $conditions
      start: $start
      limit: $limit
    ) {
      total
      list {
        longJobUuid
        clientJobUuid
        jobName
        resourceType
        state
        progress
        taskProgressDetails {
          taskName
          content
          type
          arguments
          opaque {
            remain
            remaining_migration_time
            speed
            total
          }
        }
        createDate
        lastOpDate
      }
    }
  }
`;

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  actionId?: string;
  zIndex?: number;
}
export interface ITaskProgressInfo {
  speed?: string | null;
  total?: number;
  remain?: number;
  remainingMigrationTime?: number;
  content?: number;
}

export const migrateVmApiType: string[] = [
  "APIMigrateVmMsg",
  "APIPrimaryStorageMigrateVmMsg",
];

const OperationDetail: React.FC<IProps> = ({
  actionId,
  visible,
  setVisible,
  zIndex,
}) => {
  const intl = useIntl();
  const [_taskProgressInfo, setTaskProgressInfo] = useState<ITaskProgressInfo>(
    {},
  );
  const { getServerTime } = useTime();
  const [intervalTime, setIntervalTime] = useState<number | null>(null);
  const translateSpeed = useTranslateSpeed();

  const [longJobState, setLongJobState] = useState<OperationLongjobStatus>();

  const { data, loading, refetch, operationLog } = useOperationLog(actionId);
  const currentLongjob = useMemo(
    () => (operationLog ? getAllLongjobs(operationLog)?.[0] : undefined),
    [operationLog],
  );

  useEffect(() => {
    setLongJobState(currentLongjob?.state);
  }, [currentLongjob, data]);

  const options = useOptions(operationLog);
  const isLogCollect = useIsLogCollect(operationLog);

  useUpdateEffect(() => {
    if (visible) {
      setFilterCondition("all");
    }
  }, [actionId, visible]);

  const [getTaskProgressData] = useLazyQuery(operationLongjobList, {
    fetchPolicy: "no-cache",
    onCompleted(data) {
      try {
        const taskProgressInfo: TaskProgressList = data?.operationLongjobList;

        if (taskProgressInfo?.total && taskProgressInfo?.total <= 0) {
          return;
        }

        const opaque = get(
          taskProgressInfo,
          ["list", "0", "taskProgressDetails", "opaque"],
          {},
        );

        setTaskProgressInfo((state: ITaskProgressInfo) => {
          return {
            speed: opaque?.speed
              ? translateSpeed(formatStorage(opaque?.speed || 0, 2))
              : state.speed,
            total: Number(opaque?.total) || state.total,
            remain: Number(opaque?.remain) || state.remain,
          };
        });
      } catch {
        // console.log('e', error)
      }
    },
  });

  useInterval(() => {
    getTaskProgressData({
      variables: {
        conditions: [
          {
            key: "clientJobUuid",
            value: currentLongjob?.clientJobUuid,
            op: Op.eq,
          },
        ],
        limit: 1,
      },
    });
    if (currentLongjob?.state === OperationLongjobStatus.RUNNING) {
      setIntervalTime(5000);
    } else {
      setIntervalTime(null);
    }
  }, intervalTime);

  useEffect(() => {
    if (
      visible &&
      currentLongjob?.clientJobUuid &&
      includes(migrateVmApiType, currentLongjob?.jobName)
    ) {
      setIntervalTime(1000);
    }
    return () => {
      setTaskProgressInfo({});
      setIntervalTime(null);
    };
  }, [
    currentLongjob?.clientJobUuid,
    currentLongjob?.jobName,
    currentLongjob?.state,
    visible,
  ]);

  useActionSubscribe({
    resourceTypeList: ["Image"],
    onProgress() {
      refetch();
    },
  });
  useEffect(() => {
    if (operationLog && operationLog.operationTasks?.length) {
      const currentTask = operationLog.operationTasks[0];
      setCurrentTask(currentTask);
    }
  }, [operationLog]);

  const isMultipleOperation = useMemo<boolean>(() => {
    return (operationLog?.operationTasks?.length || 0) > 1;
  }, [operationLog]);

  const { filterTask, filterCondition, setFilterCondition } =
    useFilter(operationLog);

  useUpdateEffect(() => {
    const currentTask = filterTask?.[0];
    setCurrentTask(currentTask);
  }, [filterCondition]);

  const resourceName = useResourceName(operationLog);

  const [currentTask, setCurrentTask] = useState<OperationTask | undefined>();
  const [currentApi, setCurrentApi] = useState<OperationApi | undefined>();
  const [apiVisible, setApiVisible] = useState<boolean>(false);

  useEffect(() => {
    const defaultApi = currentTask?.operationApis?.[0];
    if (defaultApi) {
      setCurrentApi(defaultApi);
    }
  }, [currentTask]);

  useEffect(() => {
    const _refetch = () => refetch();
    bus.addListener(`action:finish:${actionId}`, _refetch);
    return () => {
      bus.removeListener(`action:finish:${actionId}`, _refetch);
    };
  }, [actionId, refetch]);

  const { basicInfoList, complete } = useBasicInfoList(
    operationLog,
    resourceName,
    isMultipleOperation,
    longJobState,
    _taskProgressInfo,
  );

  const currentTaskList = useCurrentTaskList(currentTask);

  const showApiDetail = (operationApi: OperationApi) => {
    setCurrentApi(operationApi);
    setApiVisible(true);
  };

  const currentApiList = useCurrentApiList(showApiDetail, currentTask);

  const contentEl = useMemo(() => {
    if (!actionId) {
      return null;
    }
    if (loading && !data) {
      return <Spin />;
    }
    if (apiVisible) {
      return (
        currentApi && (
          <QueueAnim>
            <ApiDetailModal
              key="ApiDetail"
              api={currentApi}
              visible={apiVisible}
              setVisible={setApiVisible}
            />
          </QueueAnim>
        )
      );
    }
    if (operationLog) {
      return (
        <div key="ActionDetail">
          {(longJobState || isLogCollect) && (
            <div className={style.header}>
              {longJobState && (
                <ResumeButton
                  complete={complete}
                  operationLog={operationLog}
                  longJobState={longJobState}
                  setLongJobState={setLongJobState}
                />
              )}
              {isLogCollect && (
                <CancelLogCollect
                  operationLog={operationLog}
                  setVisible={setVisible}
                />
              )}
            </div>
          )}
          <div className={style.operationDetail}>
            <DraggableCard
              title={intl.formatMessage({
                id: "baseInfo",
                defaultMessage: "Basic Info",
              })}
            >
              <List list={basicInfoList} bordered={false} />
            </DraggableCard>

            {isMultipleOperation && (
              <>
                <Field
                  className={style.subTaskTitle}
                  label={intl.formatMessage({
                    id: "subTask.detail",
                    defaultMessage: "Sub-task Details",
                  })}
                  colon={false}
                >
                  <Select
                    className={style.subTaskSelect}
                    getPopupContainer={() => document.body}
                    defaultValue={filterCondition}
                    value={filterCondition}
                    onChange={(value: string) =>
                      setFilterCondition(value as string)
                    }
                    options={options}
                    width="s"
                  />
                </Field>
                <div className={style.taskContainer}>
                  <div className={style.taskDotContainer}>
                    {filterTask.map((cv) => (
                      <TaskDot
                        key={cv.taskId}
                        checked={cv.taskId === currentTask?.taskId}
                        task={cv}
                        onClick={(task) => {
                          setCurrentTask(task);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <DraggableCard
                  className={style.card}
                  title={intl.formatMessage({
                    id: "sub.task.baseInfo",
                    defaultMessage: "Subtask Basic Information",
                  })}
                >
                  <List list={currentTaskList} bordered={false} />
                </DraggableCard>
              </>
            )}

            <DraggableCard
              className={style["cart-margin-top"]}
              title={intl.formatMessage({
                id: "api.run.result",
                defaultMessage: "API Results",
              })}
            >
              {!isEmpty(currentApiList) ? (
                <List list={currentApiList} bordered={false} />
              ) : (
                <ZEmpty type="Select" />
              )}
            </DraggableCard>
          </div>
        </div>
      );
    }
    // 特殊情况下可能没有operationLog 返回Empty兜底 防止空指针
    return (
      <div className={style.emptyWrapper}>
        <ZEmpty />
      </div>
    );
  }, [
    actionId,
    apiVisible,
    currentApi,
    currentTask,
    data,
    filterCondition,
    filterTask,
    getServerTime,
    intl,
    isMultipleOperation,
    loading,
    operationLog,
    options,
    resourceName,
  ]);

  return (
    <Drawer
      open={visible}
      setOpen={(v) => {
        const next = typeof v === "function" ? v(visible) : v;
        setVisible(next);
        if (!next) {
          setApiVisible(false);
        }
      }}
      className={style.drawer}
      zIndex={zIndex}
      style={{ width: 600 }}
    >
      <DrawerHeader
        onClose={() => {
          setVisible(false);
          setApiVisible(false);
        }}
      >
        {intl.formatMessage({
          id: "task.detail",
          defaultMessage: "Task Details",
        })}
      </DrawerHeader>
      <DrawerBody>
        <div className="w-full">{contentEl}</div>
      </DrawerBody>
    </Drawer>
  );
};

export default OperationDetail;
