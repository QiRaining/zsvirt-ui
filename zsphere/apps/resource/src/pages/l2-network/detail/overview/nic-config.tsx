import { List } from "@zstack/zsphere-components";
import { DraggableCard, useSetTab } from "@zstack/zsphere-components";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: IL2Network;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const RelativeResource: React.FC<IProps> = ({
  current,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { setTab } = useSetTab();
  const list = useMemo(() => {
    const typeMap = {
      "active-backup": intl.formatMessage({
        id: "master.backup.mode",
        defaultMessage: "Active-Backup (mode1)",
      }),
      "802.3ad": intl.formatMessage({
        id: "link.aggregation.mode",
        defaultMessage: "LACP (mode 4)",
      }),
    };

    const bondMode = current?.systemTags?.bondingMode
      ? typeMap[
          current?.systemTags?.bondingMode?.includes("active-backup")
            ? "active-backup"
            : "802.3ad"
        ]
      : "-";

    const hashPolicy =
      current?.systemTags?.xmitHashPolicy &&
      current?.systemTags?.xmitHashPolicy !== "null"
        ? current?.systemTags?.xmitHashPolicy
        : "-";

    return [
      {
        label: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        value: current?.physicalInterface,
      },
      {
        label: intl.formatMessage({
          id: "bond.mode.in.host",
          defaultMessage: "Bond Mode",
        }),
        value: bondMode,
      },
      {
        label: intl.formatMessage({
          id: "HashPolicy",
          defaultMessage: "Hash Policy",
        }),
        value: hashPolicy,
      },
    ];
  }, [current, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "l2.nic.bond.config",
        defaultMessage: "Uplink Configuration",
      })}
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      titleActions={[
        {
          icon: "external-link",
          tooltip: intl.formatMessage({
            id: "see.more",
            defaultMessage: "More",
          }),
          onClick: () => {
            setTab("main-tab", "bondConfig");
          },
        },
      ]}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeResource;
