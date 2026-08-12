import { Detail } from "@zstack/zsphere-components";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import BlockDevice from "./block-device";
import Controller from "./controller";
import Namespace from "./namespace";
import Overview from "./overview";
import Target from "./target";

export interface IProps {
  current: any;
  visible: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
}

export default function StorageAdapterDetail({
  current,
  visible,
  onClose,
  getContainer,
}: IProps) {
  const intl = useIntl();

  const tabPanes = useMemo(() => {
    if (!current) {
      return [];
    }

    const result = [
      {
        key: "overview",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        children: <Overview current={current} />,
      },
      {
        key: "block.device",
        tab: intl.formatMessage({
          id: "block.device",
          defaultMessage: "LUN",
        }),
        children: <BlockDevice current={current} />,
      },
    ];

    if (current.type === "iSCSI") {
      result.push({
        key: "target",
        tab: intl.formatMessage({
          id: "storage.adapter.target",
          defaultMessage: "Target",
        }),
        children: <Target current={current} />,
      });
    }

    if (current.type === "NVMe") {
      result.push(
        {
          key: "controller",
          tab: intl.formatMessage({
            id: "nvme.controller",
            defaultMessage: "Controller",
          }),
          children: <Controller current={current} />,
        },
        {
          key: "namespace",
          tab: intl.formatMessage({
            id: "nvme.namespace",
            defaultMessage: "Namespace",
          }),
          children: <Namespace current={current} />,
        },
      );
    }

    return result;
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
