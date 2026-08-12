import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  resourceData?: any;
}

const PropertyConfig: React.FC<IProps> = React.memo(
  ({ onCollapseChange, collapsed = false, resourceData }) => {
    const intl = useIntl();

    const list = useMemo(
      () => [
        {
          label: intl.formatMessage({
            id: "totalAmount",
            defaultMessage: "Total",
          }),
          value: resourceData?.vm?.total ?? 0,
        },
        {
          label: intl.formatMessage({
            id: "running",
            defaultMessage: "Running",
          }),
          value: resourceData?.vm?.running ?? 0,
        },
        {
          label: intl.formatMessage({ id: "stopped", defaultMessage: "Stopped" }),
          value: resourceData?.vm?.stopped ?? 0,
        },
        {
          label: intl.formatMessage({ id: "other", defaultMessage: "Other" }),
          value: resourceData?.vm?.other ?? 0,
        },
      ],
      [resourceData, intl],
    );
    return (
      <DraggableCard
        title={intl.formatMessage({
          id: "vm.state",
          defaultMessage: "Virtual Machine Status",
        })}
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    );
  },
);

PropertyConfig.displayName = "PropertyConfig";

export default PropertyConfig;
