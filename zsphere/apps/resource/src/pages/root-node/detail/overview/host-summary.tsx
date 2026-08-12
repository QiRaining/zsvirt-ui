import { DraggableCard, List } from "@zstack/zsphere-components";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  resourceData: any;
}

const HostSummary: React.FC<IProps> = React.memo(
  ({ onCollapseChange, collapsed = false, resourceData }) => {
    const intl = useIntl();
    const list = useMemo(() => {
      return [
        {
          label: intl.formatMessage({
            id: "totalAmount",
            defaultMessage: "Total",
          }),
          value: resourceData?.host?.total ?? 0,
        },
        {
          label: intl.formatMessage({
            id: "connected",
            defaultMessage: "Connected",
          }),
          value: resourceData?.host?.connected ?? 0,
        },
        {
          label: intl.formatMessage({
            id: "disconnected",
            defaultMessage: "Disconnected",
          }),
          value: resourceData?.host?.disconnected ?? 0,
        },
        {
          label: intl.formatMessage({ id: "other", defaultMessage: "Other" }),
          value: resourceData?.host?.other ?? 0,
        },
      ];
    }, [resourceData, intl]);

    return (
      <DraggableCard
        title={intl.formatMessage({
          id: "host.state",
          defaultMessage: "Host Status",
        })}
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    );
  },
);

HostSummary.displayName = "HostSummary";

export default HostSummary;
