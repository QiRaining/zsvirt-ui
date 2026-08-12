import { useQuery } from "@apollo/client";
import { Alert } from "@zstack/design";
import { Tabs, TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { ZWatchAlarmQueryType, Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AlarmMessageList from "zsv_shared/alarm-message/list";

import { zwatchAlarmList } from "../../../../gql/zwatch-alarm.gql";
import EndpointList from "../../../zwatch-endpoint/list";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";

const ZwatchDetail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(zwatchAlarmList, {
    variables: {
      type: ZWatchAlarmQueryType.Event,
      conditions: [
        {
          key: "uuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    },
  });
  const current = data?.zwatchAlarmList?.list?.[0] || {};

  useActionSubscribe({
    resourceTypeList: ["ZWatchAlarmVO"],
    onFinish: () => {
      refetch?.();
    },
  });

  return (
    <AutoSkeleton name="event-alarm-detail" loading={loading}>
      {current?.uuid ? (
        <div className="main-list">
          <Header current={current} refetch={refetch} />
          <Tabs type="line">
            <TabPane
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              {current.eventName === "HostPhysicalDiskStatusAbnormal" && (
                <Alert variant="info" closable style={{ marginBottom: 12 }}>
                  {intl.formatMessage({
                    id: "alarm.HostPhysicalDiskStatusAbnormal.alert.info",
                    defaultMessage: "This alarm only monitors disks that are managed by RAID.",
                  })}
                </Alert>
              )}
              <Overview current={current} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "endpoint",
                defaultMessage: "Endpoint",
              })}
              key="zwatch.end.point"
            >
              <EndpointList
                view="sub.virtualization.event"
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
                id: "zwatchRecord",
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
                      key: "subscriptionUuid",
                      op: Op.eq,
                      value: current?.uuid,
                    },
                    {
                      key: "alarmType",
                      op: Op.eq,
                      value: "event",
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
