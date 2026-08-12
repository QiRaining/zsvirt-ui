import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { ResourceName, List } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

export interface IProps {
  detail: IBaremetalInstance;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const RelativeObject: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const leftnav = searchParams.get("leftnav") || "";

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "dateCenter",
          defaultMessage: "Data Center",
        }),
        value: (
          <ResourceName
            value={detail?.zone?.name}
            link={{
              uuid: detail.zone?.uuid,
              to: "/zone",
              microAppName: "virtualization-resource",
              leftnav: leftnav || undefined,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "baremetalCluster",
          defaultMessage: "Bare Metal Cluster",
        }),
        value: (
          <ResourceName
            value={detail?.cluster?.name}
            link={{
              uuid: detail.cluster?.uuid,
              to: "/baremetal-cluster",
              microAppName: "virtualization-resource",
              leftnav: leftnav || undefined,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "baremetalChassis",
          defaultMessage: "Bare Metal Chassis",
        }),
        value: (
          <ResourceName
            value={detail?.baremetalChassis?.name}
            link={{
              uuid: detail.baremetalChassis?.uuid,
              to: "/baremetal-chassis",
              microAppName: "virtualization-resource",
              leftnav: leftnav || undefined,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "image",
          defaultMessage: "Image",
        }),
        value: (
          <ResourceName
            value={detail?.image?.name}
            link={{
              uuid: detail.image?.uuid,
              to: "/image",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.TemplateVm,
            }}
          />
        ),
      },
    ],
    [intl, detail, leftnav],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "relative.object",
        defaultMessage: "Related Objects",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeObject;
