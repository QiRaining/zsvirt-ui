import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import EditBondConfig from "../../action/edit-bond-config";

import styles from "./style.module.less";

interface IProps {
  current: IL2Network;
  collapsed?: boolean;
  refetch?: any;
}

const RelativeResource: React.FC<IProps> = ({
  current,
  collapsed = false,
  refetch,
}) => {
  const [visible, setVisible] = useState(false);

  const intl = useIntl();
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

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "l2.nic.bond.config",
        defaultMessage: "Uplink Configuration",
      })}
      collapsed={collapsed}
      titleActions={
        (current?.isDefault && current.isUplinkBondingExist) ||
        !current?.physicalInterface
          ? []
          : [
              {
                icon: "edit",
                authKey: "edit",
                resource: "bond",
                title: intl.formatMessage({
                  id: "edit.config",
                  defaultMessage: "Modify Configuration",
                }),
                tooltip: intl.formatMessage({
                  id: "edit.config",
                  defaultMessage: "Modify Configuration",
                }),
                onClick: () => setVisible(true),
              },
            ]
      }
      className={styles["draggable-card"]}
    >
      <List list={list} bordered={false} />
      <EditBondConfig
        visible={visible}
        setVisible={setVisible}
        selectedList={memoizedSelectedList}
        view="zsv.deatial"
        position="row"
        refetch={refetch}
      />
    </DraggableCard>
  );
};

export default RelativeResource;
