import { Detail } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { ActionTaskState } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Audit from "./audit";
import Overview from "./overview";

export interface IProps {
  current?: VmCustomSpecification;
  open: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
}

export default function VmSpecDetail({
  current,
  open,
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
        key: "auditing",
        tab: intl.formatMessage({ id: "auditing", defaultMessage: "Event" }),
        children: <Audit current={current} />,
      },
    ];
  }, [intl, current]);

  useActionSubscribe({
    resourceTypeList: ["VmCustomSpecification"],
    onProgress: (result) => {
      if (
        open &&
        result.listenerType === "delete" &&
        result.state === ActionTaskState.success &&
        result.id === current?.uuid
      ) {
        onClose();
      }
    },
  });

  return (
    <Detail.Drawer
      open={open}
      onClose={onClose}
      tabTabPanes={tabPanes}
      getContainer={getContainer}
    />
  );
}
