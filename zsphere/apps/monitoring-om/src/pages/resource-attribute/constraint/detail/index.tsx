import { Detail } from "@zstack/zsphere-components";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Overview from "./overview";

export interface IProps {
  current: ResourceAttributeConstraint;
  visible: boolean;
  onClose: () => void;
  getContainer: () => HTMLElement;
}

export default function ConstraintDetail({
  current,
  onClose,
  ...props
}: IProps) {
  const intl = useIntl();
  const tabPanes = useMemo(() => {
    return [
      {
        key: "overview",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        children: <Overview current={current} onDelete={onClose} />,
      },
    ];
  }, [intl, current, onClose]);

  return <Detail.Drawer {...props} onClose={onClose} tabTabPanes={tabPanes} />;
}
