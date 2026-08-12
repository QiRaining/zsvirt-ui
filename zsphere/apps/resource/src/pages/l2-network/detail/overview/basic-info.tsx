import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  DraggableCard,
  ResourceName,
  List,
  ShareType,
} from "@zstack/zsphere-components";
import { LongText } from "@zstack/zsphere-design-biz";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  current: IL2Network;
}

const BasicInfo: React.FC<IProps> = ({
  onCollapseChange,
  collapsed = false,
  current,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.l3network.num",
          defaultMessage: "Distributed Port Groups",
        }),
        value: current?.l3networkNum,
      },
      {
        label: intl.formatMessage({
          id: "cluster.num",
          defaultMessage: "Clusters",
        }),
        value: current?.clusters?.length ?? 0,
      },
      {
        label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
        value: (
          <ResourceName
            value={current?.owner?.name}
            link={
              current?.owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e"
                ? undefined
                : { to: "need to do", microAppName: "needtodo" }
            }
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "shareType",
          defaultMessage: "Sharing Mode",
        }),
        value: <ShareType type={current?.shareType} />,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: <LongText value={current?.description || undefined} />,
        canModify: true,
      },
      {
        label: "UUID",
        value: current.uuid,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "create.date",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(current.createDate!).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [intl, getServerTime, current],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
