import type { Host as IHost } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";
import ZWatchAlarmInDetailTab from "zsv_shared/zwatch-alarm/alarm-tab";

import { AuthCheck } from "../../../../components/no-permission-page/context";

export interface IProps {
  current: IHost;
}

const AlarmList: FC<IProps> = ({ current }) => {
  return (
    <AuthCheck
      resourceTypes={[
        "virtualization.zwatch.alarm",
        "virtualization.alarm.message",
      ]}
    >
      <ZWatchAlarmInDetailTab
        source={current}
        view="sub.host"
        nameSpace="ZStack/Host"
        defaultQuery={{
          extraConditions: [
            {
              key: "resourceUuid",
              value: current?.uuid,
            },
          ],
        }}
      />
    </AuthCheck>
  );
};

export default AlarmList;
