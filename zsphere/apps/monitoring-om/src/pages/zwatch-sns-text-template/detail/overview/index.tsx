import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { SNSTextTemplate } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { Platform } from "../../constant";
import AlarmInfo from "./alarm-info";
import BasicInfo from "./basic-info";
import MicroSoft from "./micro-soft";
import SmsOverview from "./sms-info";

interface IProps {
  current: SNSTextTemplate;
  refetch?: any;
  resourceConfig?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const _intl = useIntl();

  if (
    [Platform.MicrosoftTeams, Platform.HTTP].includes(
      current.applicationPlatformType as Platform,
    )
  ) {
    return <MicroSoft refetch={refetch} current={current} />;
  }

  if (current.applicationPlatformType === Platform.AliyunSms) {
    return <SmsOverview refetch={refetch} current={current} />;
  }

  const dataSet = useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo refetch={refetch} detail={current} {...props} />
        ),
      },
      AlarmInfo: {
        resourceKey: "AlarmInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <AlarmInfo detail={current} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-vm"
      cols={2}
      dataSet={dataSet}
    />
  );
};

export default Overview;
