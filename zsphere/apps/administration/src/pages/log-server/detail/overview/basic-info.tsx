import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { LogServer } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import {
  DELIVERY_TARGETS,
  type LogServerDeliveryTarget,
  type LogServerLogType,
} from "../../action/schema";

interface IProps {
  detail: LogServer;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: Function;
}

const EMPTY_VALUE = "-";

const parseJsonRecord = (value?: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "string") {
    return {};
  }

  try {
    const result = JSON.parse(value);
    return result && typeof result === "object" && !Array.isArray(result)
      ? (result as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const getString = (value: unknown) => (typeof value === "string" ? value : "");

const normalizeTls = (value: unknown) => value === "on";

const getDeliveryTarget = (value: unknown): LogServerDeliveryTarget | "" => {
  const deliveryTarget = getString(value);

  return DELIVERY_TARGETS.includes(deliveryTarget as LogServerDeliveryTarget)
    ? (deliveryTarget as LogServerDeliveryTarget)
    : "";
};

export const getLogServerDetailConfig = (configuration?: string | null) => {
  const envelope = parseJsonRecord(configuration);
  const targetConfig = parseJsonRecord(envelope.configuration);

  return {
    deliveryTarget: getDeliveryTarget(
      envelope.type ?? envelope.deliveryTarget ?? envelope.appenderType,
    ),
    protocol: getString(targetConfig.protocol ?? targetConfig.mode),
    esIndex: getString(targetConfig.index),
    esTls: normalizeTls(targetConfig.tls),
    kafkaTopics: getString(targetConfig.topics),
    lokiLabelsJob: getString(targetConfig.labels ?? targetConfig.labelsJob),
    lokiTls: normalizeTls(targetConfig.tls),
  };
};

const BasicInfo: FC<IProps> = ({ detail, onCollapseChange, collapsed }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const list = React.useMemo<Array<ListItem>>(() => {
    const format = (id: string, defaultMessage: string) =>
      intl.formatMessage({ id, defaultMessage });
    const getTlsLabel = (enabled: boolean) =>
      enabled ? format("open", "开启") : format("closed", "关闭");
    const config = getLogServerDetailConfig(detail?.configuration);
    const logType = detail?.logType as LogServerLogType;
    const deliveryTarget = config.deliveryTarget;
    const targetItems: Array<ListItem> = (() => {
      switch (deliveryTarget) {
        case "Elasticsearch":
          return [
            {
              label: "Index",
              value: config.esIndex || EMPTY_VALUE,
            },
            {
              label: "TLS",
              value: getTlsLabel(Boolean(config.esTls)),
            },
          ];
        case "Loki":
          return [
            {
              label: "Labels Job",
              value: config.lokiLabelsJob || EMPTY_VALUE,
            },
            {
              label: "TLS",
              value: getTlsLabel(Boolean(config.lokiTls)),
            },
          ];
        case "Syslog":
          return [
            {
              label: format("protocol", "协议"),
              value: config.protocol || EMPTY_VALUE,
            },
          ];
        case "Kafka":
          return [
            {
              label: "Topics",
              value: config.kafkaTopics || EMPTY_VALUE,
            },
          ];
        default:
          return [];
      }
    })();
    const managementItems: Array<ListItem> =
      logType === "management"
        ? [
            {
              label: format("log.facility", "日志设备"),
              value: detail?.facility || EMPTY_VALUE,
            },
            {
              label: format("log.level", "日志级别"),
              value: detail?.level || EMPTY_VALUE,
            },
          ]
        : [];

    return [
      {
        label: format("name", "名称"),
        value: detail?.name || EMPTY_VALUE,
      },
      {
        label: format("log.category", "日志类型"),
        value:
          logType === "platform"
            ? format("logServer.logType.platform", "平台操作日志")
            : format("logServer.logType.management", "管理节点日志"),
      },
      {
        label: format("logServer.field.deliveryTarget", "投递目标"),
        value: deliveryTarget || EMPTY_VALUE,
      },
      {
        label: format("address", "地址"),
        value: detail?.hostname || EMPTY_VALUE,
      },
      {
        label: format("port", "端口"),
        value: detail?.port || EMPTY_VALUE,
      },
      ...targetItems,
      ...managementItems,
      {
        label: "UUID",
        value: detail?.uuid,
        copyable: true,
      },
      {
        label: format("create.date", "创建时间"),
        value: detail?.createDate
          ? getServerTime(detail.createDate).format("YYYY-MM-DD HH:mm:ss")
          : EMPTY_VALUE,
      },
    ];
  }, [getServerTime, intl, detail]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
