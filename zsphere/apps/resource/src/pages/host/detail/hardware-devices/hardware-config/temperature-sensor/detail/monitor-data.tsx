import type { Sensor } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
// import { MonitorChart, MonitorCard, MonitorTime } from '@zstack/zsphere-components'

export interface IProps {
  current: Sensor;
  hostUuid: string;
  metricProps: any;
}

export default function MonitorData({
  current: _current,
  hostUuid: _hostUuid,
  metricProps: _metricProps,
}: IProps) {
  const _intl = useIntl();
  return (
    <>TODO monitor</>
    // <MonitorCard
    //   title={intl.formatMessage({
    //     id: 'monitor.data',
    //     defaultMessage: '监控数据'
    //   })}
    //   extra={<MonitorTime small />}
    //   monitorKeys={metricProps.metricNames}
    //   {...props}
    // >
    //   <MonitorChart
    //     namespace="ZStack/Host"
    //     resourceKey="HostUuid"
    //     resourceType="Host"
    //     uuid={hostUuid}
    //     {...metricProps}
    //   />
    // </MonitorCard>
  );
}
