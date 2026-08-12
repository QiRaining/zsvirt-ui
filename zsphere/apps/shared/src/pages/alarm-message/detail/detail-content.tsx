import { Button, Text, Tag } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import {
  Constant,
  DraggableCard,
  Link,
  List,
  ResponsiveDndCardsLayout,
  useMetricNameConfig,
  useBuildTriggerActionName,
} from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { ProfileType } from "@zstack/zsphere-types";
import type {
  AlarmHistories,
  AlarmHistories as IAlarmHistories,
} from "@zstack/zsphere-types/graphql";
import { secToTime } from "@zstack/zsphere-utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import ReactJSON from "react-json-view";

import { getHostPrefix } from "../../zwatch-alarm/resource/config/useColumnConfig";
import ActionBtn from "../action";
import { genSourceName } from "../config/useColumnConfig";
import { copyDom } from "./utils";

import styles from "./style.module.less";

interface AlarmHistoriesDetailProps {
  row: IAlarmHistories;
  name: string;
  useFor?: "main-nav" | "column"; // 主导航和列表使用
  visible?: boolean;
  setVisible?: (arg: any) => void;
  refetch?: Function;
  isLayoutList?: boolean;
}

enum AlarmType {
  //资源报警器
  Resource,
  //事件报警器
  Event,
}

const Content: React.FC<AlarmHistoriesDetailProps> = ({
  row,
  setVisible,
  refetch,
}: AlarmHistoriesDetailProps) => {
  const intl = useIntl();
  const buildTriggerName = useBuildTriggerActionName();

  const alarmType = row.type === "alarm" ? AlarmType.Resource : AlarmType.Event;

  const { getServerTime } = useTime();

  const formatSecToTime = React.useCallback(
    (s: number) => {
      const time = secToTime(s);
      let str = "";
      if (time.day > 0 || time.hour > 0) {
        str +=
          time.day * 24 +
          time.hour +
          intl.formatMessage({
            id: "hours",
            defaultMessage: "hours",
          });
      }
      if (time.minute > 0) {
        str +=
          time.minute +
          intl.formatMessage({
            id: "minites",
            defaultMessage: "Minutes",
          });
      }
      if (time.second > 0) {
        str +=
          time.second +
          intl.formatMessage({
            id: "second",
            defaultMessage: " seconds",
          });
      }
      if (time.hour === 0 && time.minute === 0 && time.second === 0) {
        str =
          0 +
          intl.formatMessage({
            id: "second",
            defaultMessage: " seconds",
          });
      }
      return str;
    },
    [intl],
  );

  const {
    translateNamespaceToName,
    translateThreshold,
    translateAlarmNameByLocale,
  } = useMetricNameConfig();

  const { metricName, namespace, metricValue, createTime: time } = row;

  const isValidJSON = (str: string | undefined) => {
    try {
      JSON.parse(String(str));
      return true;
    } catch {
      return false;
    }
  };

  const detailRef = useRef(null);
  const copyId = useRef<number>();
  const [copied, setCopied] = useState(false);
  const copyFn = useCallback(() => {
    copyDom(detailRef);
    setCopied(true);
    copyId.current = window.setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, []);

  useEffect(() => {
    window.clearTimeout(copyId.current);
  }, []);

  const renderAction = useCallback(
    (alarmData: AlarmHistories) => {
      const copyButton = (
        <Button
          variant="secondary"
          className="zstack-action-btn"
          data-testid="action-handle.copy"
          icon={copied ? <Icon type="checkmark" /> : <Icon type="copy" />}
          style={{
            marginRight: 4,
            display: "inline-flex",
            alignItems: "center",
          }}
          onClick={copyFn}
        >
          {intl.formatMessage({ id: "copy", defaultMessage: "Copy" })}
        </Button>
      );
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {copyButton}
          <ActionBtn
            selectedList={[alarmData]}
            view="main"
            position="header"
            refetch={refetch}
            getPopupContainer={(node) => node?.parentElement || document.body}
          />
        </div>
      );
    },
    [copied, intl, refetch, copyFn],
  );

  const dataSet = React.useMemo(() => {
    const showSilenceInfo = row.ackData?.ackPeriod && !row.ackData?.resumeAlert;
    const res: any = {};

    if (showSilenceInfo) {
      res.silenceInfo = {
        resourceKey: "silenceInfo",
        x: 0,
        y: 0,
        node: (props: any) => (
          <DraggableCard
            title={intl.formatMessage({
              id: "silence.info",
              defaultMessage: "Silent Information",
            })}
            isList
            {...props}
          >
            <List
              list={[
                {
                  label: intl.formatMessage({
                    id: "silencePeriod",
                    defaultMessage: "Muted for",
                  }),
                  value: formatSecToTime(
                    parseInt(row?.ackData?.ackPeriod ?? 0, 10),
                  ),
                },
                {
                  label: intl.formatMessage({
                    id: "ack.start.time",
                    defaultMessage: "Muted Since",
                  }),
                  value: getServerTime(row.ackData?.ackDate ?? 0).format(
                    "YYYY-MM-DD HH:mm:ss",
                  ),
                },
              ]}
              bordered={false}
            />
          </DraggableCard>
        ),
      };
    }

    const restData = {
      resourceInfo: {
        resourceKey: "resourceInfo",
        x: 0,
        y: showSilenceInfo ? 1 : 0,
        node: (props: any) => (
          <DraggableCard
            title={intl.formatMessage({
              id: "resource.info",
              defaultMessage: "Resource Information",
            })}
            isList
            {...props}
          >
            <List
              list={[
                {
                  label: intl.formatMessage({
                    id: "resourceType",
                    defaultMessage: "Resource Type",
                  }),
                  value: `${getHostPrefix(metricName)}${translateNamespaceToName(namespace!)}`,
                },
                {
                  label: intl.formatMessage({
                    id: "resource",
                    defaultMessage: "Inventory",
                  }),
                  value: genSourceName(intl, row, (e) => {
                    e.stopPropagation();
                    setVisible?.(false);
                  }),
                },
                {
                  label: intl.formatMessage({
                    id: "resource.tag",
                    defaultMessage: "Resource Tag",
                  }),
                  value: row.resource?.tags?.map((tag) => (
                    <Tag color={tag.color!} key={tag.uuid}>
                      {tag.name}
                    </Tag>
                  )),
                },
                ...(alarmType === AlarmType.Resource
                  ? [
                      {
                        label: intl.formatMessage({
                          id: "resourceInfomation",
                          defaultMessage: "Resource Infomation",
                        }),
                        value: row.context,
                      },
                    ]
                  : []),
                {
                  label: intl.formatMessage({
                    id: "resourceUuid",
                    defaultMessage: "Resource UUID",
                  }),
                  value: row?.resourceUuid ? row?.resourceUuid : null,
                },
              ]}
              bordered={false}
            />
          </DraggableCard>
        ),
      },
      alarmInfo: {
        resourceKey: "alarmInfo",
        x: 0,
        y: showSilenceInfo ? 2 : 1,
        node: (props: any) => (
          <DraggableCard
            title={intl.formatMessage({
              id: "alert.info",
              defaultMessage: "Alert Information",
            })}
            isList
            {...props}
          >
            <List
              list={[
                {
                  label: intl.formatMessage({
                    id: "emergencyLevel",
                    defaultMessage: "Severity",
                  }),
                  value: (
                    <Constant
                      value={
                        row.emergencyLevel! as "Normal" as ConstantEnum.Normal
                      }
                    />
                  ),
                },
                ...(alarmType === AlarmType.Resource
                  ? [
                      {
                        label: intl.formatMessage({
                          id: "triggerCondition",
                          defaultMessage: "Trigger Condition",
                        }),
                        value: <div>{buildTriggerName(row)}</div>,
                      },
                      {
                        label: intl.formatMessage({
                          id: "currentValue",
                          defaultMessage: "Current Value",
                        }),
                        value: translateThreshold(
                          namespace!,
                          metricName!,
                          Number(metricValue!),
                        ),
                      },
                      {
                        label: intl.formatMessage({
                          id: "alarmMachine",
                          defaultMessage: "Alarm",
                        }),
                        value: (
                          <Link.Detail
                            to={`/zwatch-alarm/${row.type === "alarm" ? "resource" : "event"}`}
                            uuid={row?.alarmUuid ?? ""}
                            microAppName="virtualization-monitoring-om"
                            isRouterManaged
                            onClick={(e: any) => {
                              e.stopPropagation();
                              setVisible?.(false);
                            }}
                          >
                            {translateAlarmNameByLocale(
                              row.alarmName,
                              row.alarmZhName,
                            )}
                          </Link.Detail>
                        ),
                      },
                    ]
                  : []),
                ...(alarmType === AlarmType.Event
                  ? [
                      {
                        label: intl.formatMessage({
                          id: "eventDetail",
                          defaultMessage: "Event Details",
                        }),
                        value:
                          row.labels && isValidJSON(row.labels) ? (
                            <ReactJSON
                              src={JSON.parse(row.labels! ?? "{}")}
                              collapsed
                            />
                          ) : (
                            <Text>{row.labels}</Text>
                          ),
                      },
                    ]
                  : []),
                {
                  label: intl.formatMessage({
                    id: "alarm.message.confirm.state",
                    defaultMessage: "Acknowledged",
                  }),
                  value: (
                    <Constant
                      enumType={ConstantType.AlarmMessageConfirmState}
                      value={
                        row.readStatus ? ConstantEnum.true : ConstantEnum.false
                      }
                    />
                  ),
                },
                {
                  label: intl.formatMessage({
                    id: "confirmer",
                    defaultMessage: "Acknowledged by",
                  }),
                  value: row.operatorAccountUuid ? (
                    <Link.Owner uuid={row.operatorAccountUuid}>
                      {row.operatorAccount?.name}
                    </Link.Owner>
                  ) : null,
                },
                {
                  label: intl.formatMessage({
                    id: "messageUuid",
                    defaultMessage: "Message UUID",
                  }),
                  value: row.dataUuid,
                },
                {
                  label: intl.formatMessage({
                    id: "firstAlarmTime",
                    defaultMessage: "First Alarm Time",
                  }),
                  value: getServerTime(Number(row.firstTime)!).format(
                    "YYYY-MM-DD HH:mm:ss",
                  ),
                },
                {
                  label: intl.formatMessage({
                    id: "lastAlarmTime",
                    defaultMessage: "Last Alarm Time",
                  }),
                  value: getServerTime(Number(time)!).format(
                    "YYYY-MM-DD HH:mm:ss",
                  ),
                },
              ]}
              bordered={false}
            />
          </DraggableCard>
        ),
      },
    };

    return { ...res, ...restData };
  }, [
    alarmType,
    buildTriggerName,
    formatSecToTime,
    getServerTime,
    intl,
    metricName,
    metricValue,
    namespace,
    row,
    time,
    translateThreshold,
  ]);

  return (
    <div ref={detailRef}>
      {row.alarmStatus !== "OK" && (
        <div className={styles.detailHeader}>{renderAction(row)}</div>
      )}

      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-vm"
        cols={1}
        dataSet={dataSet}
      />
    </div>
  );
};

export default Content;
