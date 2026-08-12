import { Detail } from "@zstack/zsphere-components";
import type { Sensor } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Overview from "./overview";

export interface IProps {
  current: Sensor;
  hostUuid: string;
  visible: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
}

export default function SensorDetail({
  current,
  hostUuid,
  visible,
  onClose,
  getContainer,
}: IProps) {
  const intl = useIntl();
  const tabPanes = useMemo(() => {
    return [
      {
        key: "overview",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        children: <Overview current={current} hostUuid={hostUuid} />,
      },
    ];
  }, [intl, current, hostUuid]);
  return (
    <Detail.Drawer
      visible={visible}
      onClose={onClose}
      tabTabPanes={tabPanes}
      getContainer={getContainer}
    />
  );
}
