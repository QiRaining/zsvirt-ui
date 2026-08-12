import { useQuery } from "@apollo/client";
import { TabPane, Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { AlarmLabels as IAlarmLabels } from "@zstack/zsphere-types/graphql";
import { remove, includes, compact } from "lodash-es";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AlarmMessageList from "zsv_shared/alarm-message/list";

import { zwatchAlarmDetail } from "../../../../gql/zwatch-alarm.gql";
import EndPointList from "../../../zwatch-endpoint/list";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";
import useComponentMap from "./useComponentMap";

const ZwatchDetail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const { componentMap } = useComponentMap();
  const [namespace, setNamespace] = useState<string>("");
  const [showResourceTab, setShowResourceTab] = useState<boolean>(false);

  const { loading, data, refetch } = useQuery(zwatchAlarmDetail, {
    variables: {
      uuid,
    },
  });
  const current = data?.zwatchAlarmDetail || {};

  useActionSubscribe({
    resourceTypeList: ["ZWatchAlarmVO"],
    onFinish: () => {
      refetch?.();
    },
  });

  // 判断“报警资源”Tab是否显示
  useEffect(() => {
    const list = [
      "VMUuid",
      "BaremetalVMUuid",
      "BackupStorageUuid",
      "HostUuid",
      "L3NetworkUuid",
      "VipUUID",
      "PrimaryStorageUuid",
      "PoolUuid",
      "ListenerUuid",
      "projectUuid",
    ];
    const namespaceMetricNameList = ["ZStack/CdpTask/CdpTaskLatency"];
    const labels = current?.labels?.filter(
      (label: IAlarmLabels) => label.key !== "ALARM_EXCLUDE_RESOURCE_LABEL",
    );

    if (
      current.namespace === "ZStack/PrimaryStorage" &&
      [
        "PoolAvailableCapacityInPercent",
        "PoolUsedCapacityInPercent",
        "PoolVirtualAvailableCapacityInPercent",
      ].includes(current.metricName)
    ) {
      remove(labels, (it: IAlarmLabels) => it.key === "PrimaryStorageUuid");
    }

    const labelsStr = labels?.map((item: IAlarmLabels) => item.key).toString();
    // hook：单个资源 && 有指定某个配置（CPU、磁盘...）才不显示“报警资源”Tab
    if (
      list.some((str) => str === labelsStr) ||
      includes(
        namespaceMetricNameList,
        `${current?.namespace}/${current?.metricName}`,
      )
    ) {
      setShowResourceTab(true);
    } else {
      setShowResourceTab(false);
    }
  }, [current]);

  // VRouter 返回的namespace和云主机一样——ZStack/VM，但有个userTag做区分
  useEffect(() => {
    if (
      current?.namespace === "ZStack/VM" &&
      current?.userTag?.tag === "VRouter"
    ) {
      setNamespace("ZStack/VRouter");
    } else {
      setNamespace(current?.namespace);
    }
  }, [current]);

  return (
    <AutoSkeleton name="resource-alarm-detail" loading={loading}>
      {current?.uuid ? (
        <div className="zsv-detail-container">
          <Header
            current={current}
            refetch={refetch}
            source={{ componentMap }}
          />
          <Tabs type="line">
            <TabPane
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <Overview
                current={current}
                refetch={refetch}
                source={{ componentMap }}
              />
            </TabPane>
            {showResourceTab && (
              <TabPane
                tab={intl.formatMessage({
                  id: "alarmResource",
                  defaultMessage: "Alarm Resource",
                })}
                key="zwatch.resource"
              >
                {componentMap?.[namespace]?.getComponent(
                  current,
                  compact(current?.labels?.[0]?.value?.split("|")),
                )}
              </TabPane>
            )}
            <TabPane
              tab={intl.formatMessage({
                id: "endpoint",
                defaultMessage: "Endpoint",
              })}
              key="zwatch.end.point"
            >
              <EndPointList
                view="sub.virtualization.resource"
                source={current}
                defaultQuery={{
                  conditions: [
                    {
                      key: "topics.uuid",
                      op: Op.in,
                      values:
                        current?.actions?.map((cv: any) => cv.actionUuid) || [],
                    },
                  ],
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "alarmRecord",
                defaultMessage: "Alarm Record",
              })}
              key="zwatch.record"
            >
              <AlarmMessageList
                view="sub"
                source={current}
                defaultQuery={{
                  conditions: [
                    {
                      key: "alarmUuid",
                      op: Op.eq,
                      value: current?.uuid,
                    },
                    {
                      key: "alarmType",
                      op: Op.eq,
                      value: "alarm",
                    },
                  ],
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "auditing",
                defaultMessage: "Event",
              })}
              key="audit"
            >
              <Audit current={current} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default ZwatchDetail;
