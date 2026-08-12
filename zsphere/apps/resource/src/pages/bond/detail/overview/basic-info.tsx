import { Text } from "@zstack/design";
import { formatSpeed } from "@zstack/virtualization-resource/src/pages/physical-nic/config/useColumnConfig";
import { DraggableCard, Tag } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List } from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import { PhysicalNetworkType } from "@zstack/zsphere-types";
import type { Bond } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const flexCenterStyle = { display: "flex", alignItems: "center" } as const;
const textMarginStyle = { marginRight: "8px" } as const;
const marginNegativeStyle = { margin: "-3px 0" } as const;
const tagBackgroundStyle = { backgroundColor: "white" } as const;
const inlineFlexCenterStyle = {
  display: "inline-flex",
  alignItems: "center",
} as const;
const spanMarginStyle = { margin: "0 4px" } as const;
const spanMarginWithColorStyle = {
  margin: "0 4px",
  color: "var(--neutral-300)",
} as const;

export interface IProps {
  current: Bond;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();
  const list = useMemo<ListItem[]>(() => {
    return [
      {
        label: intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        }),
        value: (
          <div style={flexCenterStyle}>
            <Text style={textMarginStyle}>{current.bondingName}</Text>
            {current.hostNetworkBondingServiceRef?.some((item) =>
              item?.serviceTypes?.includes(
                PhysicalNetworkType.ManagementNetwork,
              ),
            ) && (
              <div style={marginNegativeStyle}>
                <Tag round style={tagBackgroundStyle}>
                  {intl.formatMessage({
                    id: "physicalNetworkType.managementNetwork",
                    defaultMessage: "Management Network",
                  })}
                </Tag>
              </div>
            )}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "common.state",
          defaultMessage: "Status",
        }),
        value: (
          <div style={inlineFlexCenterStyle}>
            <Constant value={ConstantEnum.UP} />
            <span style={spanMarginStyle}>
              {current.slaves?.filter((salve) => salve.state === "UP")
                ?.length ?? 0}
            </span>
            <span style={spanMarginWithColorStyle}>|</span>
            <Constant value={ConstantEnum.DOWN} />
            <span style={spanMarginStyle}>
              {current.slaves?.filter((salve) => salve.state === "DOWN")
                ?.length ?? 0}
            </span>
            <span style={{ margin: "0 4px", color: "var(--neutral-300)" }}>
              |
            </span>
            <Constant value={ConstantEnum.DOWN} />
            <span style={{ margin: "0 4px" }}>
              {current.slaves?.filter((salve) => salve.state === "DOWN")
                ?.length ?? 0}
            </span>
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "bond.type",
          defaultMessage: "Bond Mode",
        }),
        value: current.mode?.includes("active-backup")
          ? intl.formatMessage({
              id: "master.backup.mode",
              defaultMessage: "Active-Backup (mode1)",
            })
          : intl.formatMessage({
              id: "link.aggregation.mode",
              defaultMessage: "LACP (mode 4)",
            }),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.bond.speed",
          defaultMessage: "Bond Speed",
        }),
        value: formatSpeed(current.speed),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: current.description,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value:
          current.createDate &&
          dayjs(current.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ];
  }, [current, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      {...props}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
