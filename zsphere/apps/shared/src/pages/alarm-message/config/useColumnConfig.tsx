import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import {
  Constant,
  Link,
  ResourceName,
  useMetricNameConfig,
  useBuildTriggerActionName,
  useBuildTriggerName,
} from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/alarm-platform-message";
import { EmergencyLevel, LeftNavType } from "@zstack/zsphere-types";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";
import { pick } from "lodash-es";
import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import Detail from "../detail/detail-modal";
import { useFormatTime } from "./utils";

import styles from "./style.module.less";

const NameColumn = ({
  current: val,
  isLayoutList,
}: {
  current: AlarmHistories;
  isLayoutList?: boolean;
}) => {
  const buildTriggerName = useBuildTriggerName();
  const [visible, setVisible] = useState(false);

  const onClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(true);
  }, []);

  const name = buildTriggerName(val);

  return (
    <div
      key={val.dataUuid}
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{ width: "90%" }}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={styles["detail-wrap"]}>
          <Text>
            <a className={styles["detail-name"]} onClick={onClick}>
              {name}
            </a>
          </Text>
        </div>
        <Detail
          row={val}
          name={name}
          setVisible={setVisible}
          visible={visible}
          isLayoutList={isLayoutList}
        />
      </div>
    </div>
  );
};

export const metricNameToResource: Record<
  string,
  { path: string; microApp: string; leftNav?: LeftNavType }
> = {
  "ZStack/VM": {
    path: "/vm",
    microApp: "virtualization-resource",
    leftNav: LeftNavType.ClusterHost,
  },
  "ZStack/BaremetalVM": {
    path: "/baremetal-instance",
    microApp: "virtualization-resource",
    leftNav: LeftNavType.BareMetal,
  },
  "ZStack/Image": {
    path: "/image",
    microApp: "virtualization-resource",
    leftNav: LeftNavType.TemplateVm,
  },
  "ZStack/BackupStorage": {
    path: "/backup-storage",
    microApp: "virtualization-resource",
    leftNav: LeftNavType.TemplateVm,
  },
  "ZStack/Scheduler": {
    path: "/backup-management/backup-policy",
    microApp: "virtualization-data-protection",
  },
  "ZStack/DisasterRecoveryStorage": {
    path: "/backup-management/disaster-recovery-storage",
    microApp: "virtualization-data-protection",
  },
  "ZStack/Host": {
    path: "/host",
    microApp: "virtualization-resource",
    leftNav: LeftNavType.ClusterHost,
  },
  "ZStack/L3Network": {
    path: "/l3-network",
    microApp: "virtualization-resource",
    leftNav: LeftNavType.Network,
  },
  "ZStack/PrimaryStorage": {
    path: "/primary-storage",
    microApp: "virtualization-resource",
    leftNav: LeftNavType.DataStorage,
  },
  "ZStack/CdpTask": { path: "/cdp-task", microApp: "backup-management" },
  "ZStack/Cluster": {
    path: "/cluster",
    microApp: "virtualization-resource",
    leftNav: LeftNavType.ClusterHost,
  },
};

type metricName = keyof typeof metricNameToResource;
export const genSourceName = (
  intl: any,
  current: any,
  onClick?: (e: React.MouseEvent) => void,
) => {
  const { namespace, context, resourceName } = current;
  let _resourceName = resourceName;
  if (namespace === "ZStack/License") {
    try {
      const key = JSON.parse(context)?.ResourceType;
      if (key === "Ceph") {
        return intl.formatMessage({
          id: "distributed.storage",
          defaultMessage: "Distributed Storage",
        });
      }
      _resourceName =
        resourceName ||
        intl.formatMessage({
          id: "community.edition",
          defaultMessage: "Community Edition",
        });
    } catch {}

    const link = (
      <a
        href="virtualization-administration/license-management"
        onClick={(e) => {
          e.preventDefault();
          onClick?.(e);
          window.history.pushState(
            "license-management",
            "license-management",
            "/virtualization-administration/license-management",
          );
        }}
      >
        {_resourceName}
      </a>
    );
    return <Text>{link}</Text>;
  }

  // 迁移网关虚拟机跳转到迁移服务页面
  if (current.isGatewayVm && current.resourceName) {
    return (
      <Text value={current.resourceName}>
        <Link
          onClick={onClick}
          to="/migration-service?tab=overview"
          microAppName="virtualization-monitoring-om"
          isRouterManaged
        >
          {current.resourceName}
        </Link>
      </Text>
    );
  }

  return (
    <ResourceName
      value={current?.resourceName}
      link={{
        onClick,
        to: metricNameToResource[current.namespace as metricName]?.path ?? "/",
        microAppName:
          metricNameToResource[current.namespace as metricName]?.microApp ??
          "/",
        uuid: current?.resourceUuid,
        leftnav: metricNameToResource[current.namespace]?.leftNav,
        navView: "notGroup",
        keepState: false,
      }}
      // 这边直接给isRouterManaged赋值为真，来触发Link组件的跨子应用跳转逻辑
      // 其实比较好的办法是判断这个组件在主应用还是在子应用中，然后根据不同的情况来赋值
      // 但是目前观察下来报警消息没有跳同子应用的场景，所以这边先这样处理
      isRouterManaged
    />
  );
};

export default (isLayoutList?: boolean, view?: string) => {
  const intl = useIntl();
  const buildTriggerName = useBuildTriggerName();
  const buildTriggerActionName = useBuildTriggerActionName();
  const formatSecToTime = useFormatTime();

  const { getServerTime } = useTime();
  const getResourceName = useCallback(
    (current) => {
      return genSourceName(intl, current);
    },
    [intl],
  );

  const [alarmTypeList, setAlarmTypeList] = useState<string[] | null>(null);

  const { translateEmergencyLevel } = useMetricNameConfig();

  return useColumnConfig<AlarmHistories>([
    {
      key: "alarmMessage",
      render: (val: AlarmHistories) => (
        <NameColumn current={val} isLayoutList={isLayoutList} />
      ),
      exportToCSVRender: (val: AlarmHistories) => buildTriggerName(val),
    },
    {
      key: "triggerAction",
      formatter: (val) => buildTriggerActionName(val),
    },
    {
      key: "resourceName",
      render: (current: any) => {
        return getResourceName(current);
      },
    },
    {
      key: "emergencyLevel",
      filterOptions: EmergencyLevel,
      render: (current) =>
        translateEmergencyLevel(current?.emergencyLevel as EmergencyLevel),
    },
    {
      key: "alarmType",
      formatter: (val) =>
        val.type === "alarm"
          ? intl.formatMessage({
              id: "resourceAlarm",
              defaultMessage: "Resource Alarm",
            })
          : intl.formatMessage({
              id: "eventAlarm",
              defaultMessage: "Event Alarm",
            }),
      filters: [
        {
          text: intl.formatMessage({
            id: "resourceAlarm",
            defaultMessage: "Resource Alarm",
          }),
          value: "alarm",
        },
        {
          text: intl.formatMessage({
            id: "eventAlarm",
            defaultMessage: "Event Alarm",
          }),
          value: "event",
        },
      ],
      filteredValue: alarmTypeList,
      onFiltersChange: (val: any) => setAlarmTypeList(val),
    },
    {
      key: "alarmTimes",
      formatter: (val) => val.times,
    },
    {
      key: "ackDate",
      render: (val) =>
        val.ackData?.ackDate ? (
          <Text>
            {getServerTime(val.ackData?.ackDate).format("YYYY-MM-DD HH:mm:ss")}
          </Text>
        ) : null,
    },
    {
      key: "time",
      formatter: (val) => parseInt(val.createTime!, 10),
    },
    {
      key: "ackPeriod",
      formatter: (val) =>
        val.ackData?.ackPeriod
          ? formatSecToTime(parseInt(val.ackData?.ackPeriod, 10))
          : null,
    },
    {
      key: "confirmer",
      render: (current) => {
        return current.operatorAccountUuid ? (
          <Link.Owner uuid={current.operatorAccountUuid}>
            {current.operatorAccount?.name}
          </Link.Owner>
        ) : null;
      },
    },
    {
      key: "confirmState",
      searchKey: "readStatus",
      ...(view === "main.unread" || view === "virtualization.global.list"
        ? {
            filters: undefined,
          }
        : {}),
      filterOptions: pick(ConstantEnum, [
        ConstantEnum.true,
        ConstantEnum.false,
      ]),
      filterEnumType: ConstantType.AlarmMessageConfirmState,
      render: (current) => {
        return (
          <Constant
            enumType={ConstantType.AlarmMessageConfirmState}
            value={current.readStatus ? ConstantEnum.Read : ConstantEnum.Unread}
          />
        );
      },
    },
  ]);
};
