import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { SNSTextTemplate } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";

import Create from "../../../create";
import BasicInfo from "../basic-info";
import { EventTemplate } from "./eventTemplate";
import { ResourceTemplate } from "./resourceTemplate";

interface IProps {
  current: SNSTextTemplate;
  refetch?: any;
  resourceConfig?: any;
}

const SmsOverview: React.FC<IProps> = ({ current, refetch }) => {
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
      resourceInfo: {
        resourceKey: "AlarmInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <ResourceTemplate
            setVisible={setVisible}
            current={current}
            {...props}
          />
        ),
      },
      eventInfo: {
        resourceKey: "AlarmInfo",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <EventTemplate setVisible={setVisible} current={current} {...props} />
        ),
      },
    };

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

export default SmsOverview;
