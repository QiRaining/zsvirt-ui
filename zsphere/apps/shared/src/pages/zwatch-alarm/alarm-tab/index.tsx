import { gql, useLazyQuery, useSubscription } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { Auth, useAuth } from "@zstack/zsphere-components";
import {
  useActionSubscribe,
  useGetMillionSeconds,
} from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import { bus } from "@zstack/zsphere-utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import AlarmMessageList from "../../alarm-message/list/sub-list";
import ZWatchAlarmList from "../resource/list";

const listenZWatch = gql`
  subscription listenZWatch($sessionId: String!) {
    listenZWatch(sessionId: $sessionId) {
      sessionId
      payload
    }
  }
`;

const getAlarmHistoriesList = gql`
  query getAlarmHistoriesList($conditions: [Condition!]) {
    getAlarmHistoriesList(conditions: $conditions) {
      total
    }
  }
`;

const zwatchAlarmListGql = gql`
  query zwatchAlarmList($extraConditions: [Condition!]) {
    zwatchAlarmList(extraConditions: $extraConditions) {
      total
    }
  }
`;

interface IProps {
  view: string;
  defaultQuery?: IQuery;
  source: any;
  nameSpace: string;
}

const ZWatchAlarmInDetailTab: React.FC<IProps> = (props) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [alarmNum, setAlarmNum] = useState(0);
  const [alarmMessageNum, setAlarmMessageNum] = useState(0);

  const hasAlarmMessageAuth = hasAuth({
    resource: "virtualization.alarm.message",
    authKey: "list",
    type: "view",
  });

  const [alarmListType, setAlarmListType] = useState<
    "zwatchAlarm" | "alarmMessage"
  >(hasAlarmMessageAuth ? "alarmMessage" : "zwatchAlarm");

  const {
    MillionSeconds,
    loading: getMillionSecondsLoading,
    getMillionSeconds,
  } = useGetMillionSeconds();

  const [_getAlarmMessageTotal] = useLazyQuery(getAlarmHistoriesList, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      if (data) {
        setAlarmMessageNum(data.getAlarmHistoriesList.total ?? 0);
      }
    },
  });
  const [_zwatchAlarmList] = useLazyQuery(zwatchAlarmListGql, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      if (data) {
        setAlarmNum(data.zwatchAlarmList.total ?? 0);
      }
    },
  });

  const sourceUuid = props.source?.uuid;
  const nameSpace = props.nameSpace;

  // 稳定化 source 引用：只在 uuid 变化时才更新
  const sourceRef = useRef(props.source);
  if (sourceRef.current?.uuid !== props.source?.uuid) {
    sourceRef.current = props.source;
  }
  const stableSource = sourceRef.current;

  // 初始化只跑一次
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      getMillionSeconds();
    }
  }, [getMillionSeconds]);

  // 获取报警器列表 —— 只依赖 sourceUuid
  useEffect(() => {
    if (sourceUuid) {
      _zwatchAlarmList({
        variables: {
          extraConditions: [
            { key: "resourceUuid", op: Op.eq, value: sourceUuid },
          ],
        },
      });
    }
  }, [sourceUuid, _zwatchAlarmList]);

  // 获取报警消息数量 —— 依赖 MillionSeconds + sourceUuid
  useEffect(() => {
    if (!getMillionSecondsLoading && MillionSeconds && sourceUuid) {
      _getAlarmMessageTotal({
        variables: {
          conditions: [
            {
              key: "createTime",
              op: Op.gte,
              value: String(MillionSeconds - 7 * 24 * 60 * 60 * 1000),
            },
            {
              key: "createTime",
              op: Op.lte,
              value: String(MillionSeconds),
            },
            { key: "resourceUuid", op: Op.eq, value: sourceUuid },
            { key: "namespace", op: Op.eq, value: nameSpace },
          ],
        },
      });
    }
  }, [
    getMillionSecondsLoading,
    MillionSeconds,
    sourceUuid,
    nameSpace,
    _getAlarmMessageTotal,
  ]);

  // 订阅报警变更
  const handleAlarmChange = useCallback(() => {
    if (sourceUuid) {
      _zwatchAlarmList({
        variables: {
          extraConditions: [
            { key: "resourceUuid", op: Op.eq, value: sourceUuid },
          ],
        },
      });
    }
  }, [sourceUuid, _zwatchAlarmList]);

  useActionSubscribe({
    resourceTypeList: ["ZWatchAlarmVO"],
    onFinish: handleAlarmChange,
  });

  const { data: zwatchData } = useSubscription<{
    listenZWatch: { sessionId: string; payload: string };
  }>(listenZWatch, {
    variables: { sessionId: localStorage.getItem("sessionId") },
  });

  useEffect(() => {
    if (zwatchData?.listenZWatch) {
      getMillionSeconds();
      // 通知子列表刷新 toolbar 的 MillionSeconds，使查询时间上界包含新报警
      // toolbar MillionSeconds 更新后会自动触发 setQuery → TableList 重新查询
      bus.emit("action:refreshTime:AlarmHistories");
      handleAlarmChange();
    }
  }, [zwatchData, getMillionSeconds, handleAlarmChange]);

  const onAlarmFetchChange = useCallback(
    ({ total }: { total: number }) => setAlarmNum(total),
    [],
  );

  const onMessageFetchChange = useCallback(
    ({ total }: { total: number }) => setAlarmMessageNum(total),
    [],
  );

  const alarmMessageDefaultQuery = React.useMemo(
    () => ({
      conditions: [{ key: "resourceUuid", op: Op.eq, value: sourceUuid }],
    }),
    [sourceUuid],
  );

  // 稳定化传给子组件的 props，避免 source 引用不稳定导致子组件重渲染
  const stableProps = React.useMemo(
    () => ({ ...props, source: stableSource }),
    [props.view, props.defaultQuery, props.nameSpace, stableSource],
  );

  return (
    <>
      <RadioGroup
        value={alarmListType}
        onValueChange={(value) =>
          setAlarmListType(value as "zwatchAlarm" | "alarmMessage")
        }
        variant="outline"
        options={[
          ...(hasAlarmMessageAuth
            ? [
                {
                  value: "alarmMessage" as const,
                  label: (
                    <Auth
                      resource="virtualization.alarm.message"
                      authKey="list"
                      type="view"
                    >
                      {intl.formatMessage(
                        {
                          id: "alarmMessage.n",
                          defaultMessage: "Alarm Message({n})",
                        },
                        { n: alarmMessageNum },
                      )}
                    </Auth>
                  ),
                },
              ]
            : []),
          {
            value: "zwatchAlarm" as const,
            label: (
              <Auth
                resource="virtualization.zwatch.alarm"
                authKey="list"
                type="view"
              >
                {intl.formatMessage(
                  { id: "zwatchAlarm.n", defaultMessage: "Alarm({n})" },
                  { n: alarmNum },
                )}
              </Auth>
            ),
          },
        ]}
      />
      <div style={{ marginTop: 12 }}>
        {alarmListType === "zwatchAlarm" ? (
          <ZWatchAlarmList
            {...stableProps}
            onFetchChange={onAlarmFetchChange}
          />
        ) : (
          <AlarmMessageList
            view="sub.virtualization"
            source={stableSource}
            defaultQuery={alarmMessageDefaultQuery}
            nameSpace={nameSpace}
            onFetchChange={onMessageFetchChange}
          />
        )}
      </div>
    </>
  );
};

export default React.memo(ZWatchAlarmInDetailTab);
