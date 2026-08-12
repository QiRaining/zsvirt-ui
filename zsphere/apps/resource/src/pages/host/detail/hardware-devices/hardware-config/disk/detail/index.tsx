import { Detail } from "@zstack/zsphere-components";
import type { HostBlockDevices } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Overview from "./overview";
import Partition from "./partition";

export interface IProps {
  current: HostBlockDevices;
  hostUuid: string;
  visible: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
}

export default function DiskDetail({
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
        children: <Overview current={current} />,
      },
      {
        key: "partition",
        tab: intl.formatMessage({
          id: "disk.partition.info",
          defaultMessage: "Partition Info",
        }),
        children: <Partition current={current} hostUuid={hostUuid} />,
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
