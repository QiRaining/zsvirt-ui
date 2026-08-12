import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

interface IProps {
  detail: ICluster;
  refetch?: () => void;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const [searchParams] = useSearchParams();
  const leftnav = searchParams.get("leftnav") || "";
  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "baremetalChassis.count",
          defaultMessage: "Bare Metal Chassis",
        }),
        value: detail.baremetalChassisNum ?? "-",
      },
      {
        label: intl.formatMessage({
          id: "baremetalHost.count",
          defaultMessage: "Bare Metal Instances",
        }),
        value: detail.baremetalInstanceNum ?? "-",
      },
      {
        label: intl.formatMessage({
          id: "dataCenter",
          defaultMessage: "Data Center",
        }),
        value: detail.zone?.name ? (
          <ResourceName
            value={detail?.zone?.name}
            link={{
              uuid: detail.zone?.uuid,
              to: "/zone",
              microAppName: "virtualization-resource",
              leftnav: leftnav || undefined,
            }}
          />
        ) : (
          "-"
        ),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: (
          <ResourceName value={detail?.description || undefined} canModify />
        ),
      },
      {
        label: intl.formatMessage({ id: "uuid", defaultMessage: "UUID" }),
        value: detail.uuid,
        copyable: true,
        ellipsis: true,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [detail, intl, getServerTime],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basicInformation",
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
