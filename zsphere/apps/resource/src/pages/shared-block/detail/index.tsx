import { Detail } from "@zstack/zsphere-components";
import type { SharedBlock } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Monitor from "./monitor";
import Overview from "./overview";

export interface IProps {
  current: SharedBlock;
  visible: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
}

export default function SharedBlockDetail({
  current,
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
        key: "monitor",
        tab: intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" }),
        children: <Monitor current={current} />,
      },
    ];
  }, [intl, current]);

  return (
    <Detail.Drawer
      visible={visible}
      onClose={onClose}
      tabTabPanes={tabPanes}
      getContainer={getContainer}
    />
  );
}
