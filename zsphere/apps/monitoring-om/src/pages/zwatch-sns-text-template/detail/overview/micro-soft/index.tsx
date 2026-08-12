import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { SNSTextTemplate } from "@zstack/zsphere-types/graphql";
import { omit } from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { ZwatchSNSTextTemplateAlarmType } from "../../../constant";
import Create from "../../../create";
import BasicInfo from "../basic-info";
import Microsoft from "./microsoft-teams";
import RecoverTemplate from "./recoverTemplate";
import Template from "./template";

interface IProps {
  current: SNSTextTemplate;
  refetch?: any;
  resourceConfig?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const _intl = useIntl();
  const [visible, setVisible] = useState(false);
  const dataSet = useMemo(() => {
    const data = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo refetch={refetch} detail={current} {...props} />
        ),
      },
      Microsoft: {
        resourceKey: "AlarmInfo",
        x: 0,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <Microsoft setVisible={setVisible} current={current} {...props} />
        ),
      },
      Template: {
        resourceKey: "AlarmInfo",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <Template setVisible={setVisible} current={current} {...props} />
        ),
      },
      RecoverTemplate: {
        resourceKey: "AlarmInfo",
        x: 1,
        y: 2,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RecoverTemplate
            setVisible={setVisible}
            current={current}
            {...props}
          />
        ),
      },
    };

    // 事件报警类型的消息模板没有恢复消息文本
    if (current?.type === ZwatchSNSTextTemplateAlarmType.Event) {
      return omit(data, "RecoverTemplate");
    }

    return data;
  }, [current, refetch]);

  return (
    <>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-vm"
        cols={2}
        dataSet={dataSet}
      />
      <Create
        modalType="edit"
        visible={visible}
        setVisible={setVisible}
        selectedList={[current]}
        source={current}
        position="header"
        view="main.virtualization"
      />
    </>
  );
};

export default Overview;
